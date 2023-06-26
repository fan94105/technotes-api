const mongoose = require("mongoose")
const AutoIncrementID = require("@typegoose/auto-increment").AutoIncrementID

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    ticket: Number,
  },
  {
    timestamps: true,
  }
)

noteSchema.plugin(AutoIncrementID, { field: "ticket", startAt: 500 })

module.exports = mongoose.model("Note", noteSchema)
