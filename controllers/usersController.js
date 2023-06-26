const bcrypt = require("bcrypt")

const User = require("../models/User")
const Note = require("../models/Note")

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password").lean().exec()
  if (!users) {
    return res.status(400).json({ message: "No users found" })
  }
  res.json(users)
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // 檢查重複 username
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec()
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" })
  }

  // hash password
  const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

  // 判斷是否提供 roles
  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles }

  const user = await User.create(userObject)
  if (user) {
    res.status(201).json({ message: `New user ${username} created` })
  } else {
    res.status(400).json({ message: "Invalid user data received" })
  }
}

// @desc Update user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
  const { id, username, password, roles, active } = req.body

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" })
  }

  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  // 檢查重複 username
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec()
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10)
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.username} updated` })
}

// @desc Delete user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({ message: "User ID Required" })
  }

  const note = await Note.findOne({ user: id }).lean().exec()
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" })
  }

  // 確認 user 存在
  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} deleted`

  res.json(reply)
}

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
}
