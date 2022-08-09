const Tags = require("../models/tags.model");

async function createTag(data, callback) {
  Tags.create(data)
    .then((res) => {
      return callback(null, res);
    })
    .catch((e) => {
      return callback(e);
    });
}

async function updateTag(data, callback) {
  const { id } = data;
  await Tags.findByIdAndUpdate(id, data, {
    useFindAndModify: true,
    new: true,
  })
    .then((res) => {
      if (res == null || res == undefined) {
        return callback({ status: 404, message: "Tag not found!" });
      }
      return callback(null, res);
    })
    .catch((e) => {
      return callback(e);
    });
}

async function getTags(params, callback) {
  const tags = await Tags.find({});
  return callback(null, tags);
}

async function deleteTag(params, callback) {
  const { id } = params;
  const tags = await Tags.findByIdAndDelete(id);
  if (tags) {
    return callback(null, tags);
  } else {
    return callback({ status: 404, message: "Tag not found!" });
  }
}

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag,
};
