import { asyncHandler } from "../utlis/asynchHandler.js";
import { ApiError } from "../utlis/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utlis/cloudinary.js";
import { ApiResponse } from "../utlis/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get data from user
  //validations - not empty
  //check if user already exist --username or email
  //check for images, check for avatar
  //upload them to cloudinary, avatar
  //create user object - create entry in db
  //remove password and refresh token feed
  //check for user creation
  //return response
  const { username, email, fullName, password } = req.body;
  console.log("username", username);

  //validation for empty fields
  if (
    [fullName, email, username, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "fullName is required");
  }

  //to check if user is already present
  const existedUser = User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exist");
  }

  //handling images from multer in local
  const avatarLocalPath = req.files?.avatar[0]?.path; //saving path url
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload avatar or coverImage on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //creating user in db -- in db _id is created by mongodb, so checking here if user is created
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //removing fields which we do not want from db after finding the user from mongodb
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //if everything is correct, then returning response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export { registerUser };
