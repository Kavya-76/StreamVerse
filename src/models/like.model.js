import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },

    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },

    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    },

    likedBy: {
        type: mongoose.Schema.Tyeps.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

likeSchema.plugin(mongooseAggregatePaginate);
export const Like = mongoose.model("Like", likeSchema)