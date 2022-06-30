const Tags = require("../models/tags.model");

async function addTag(params, callback) {
  console.log(params);
  Tags.create(params)
    .then((res) => {
      console.log(res);
      return callback(null, res);
    })
    .catch((e) => {
      console.log(e);
      return callback(e);
    });
}

async function getTags(params, callback) {
  const tags = await Tags.find({});
  return callback(null, tags);
}

async function updateTag(params, callback) {
  const { id } = params;
  console.log("updateTag ",id);
  await Tags.findByIdAndUpdate(id, params, {
    useFindAndModify: true,
    new: true,
  }).then((res) => {
    console.log(res);
    return callback(null, res);
  }
  ).catch((e) => {
    console.log(e);
    return callback(e); 
  }
  );
  
}

async function deleteTag(params, callback) {
  const { id } = params;
  const tags = await Tags.findByIdAndDelete(id);
  return callback(null, tags);
}

module.exports = {
  addTag,
  getTags,
  updateTag,
  deleteTag,
};
