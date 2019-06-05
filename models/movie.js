const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema (
    {
        title: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: false
        },
        poster_path: {
            type: String,
            required: false
        },
        release_date: {
            type: String,
            required: false
        },
        overview: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ["DRAFT", "PUBLISHED"],
            default: "DRAFT"
        }
    },
    {
        timestamps: true
    }
);

MovieSchema.query.drafts = function(){
    return this.where({
        status: "DRAFT"
    });
};

MovieSchema.query.published = function(){
    return this.where({
        status: "PUBLISHED"
    });
};

module.exports = mongoose.model("Movie", MovieSchema);