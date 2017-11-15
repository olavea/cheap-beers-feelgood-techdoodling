const mongoose = require('mongoose');
mongoose.Promise = global.Promise; 
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
      type: String,
      trim: true,
      required: 'Please enter a store name!'
  },
  slug: String,
  description: {
      type: String,
      trim: true
  }, 
  tags: [String]
});

//Pre save hoook 
storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); //skipt it
    return; //stop this function from running
}
  this.slug = slug(this.name);
  next();
  //TODO
})

module.exports  = mongoose.model('Store', storeSchema);