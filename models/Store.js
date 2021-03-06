const mongoose = require('mongoose');
mongoose.Promise = global.Promise; 
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
      type: String,
      trim: true,
      required: 'Please enter a sketchNote location name!'
  },
  slug: String,
  description: {
      type: String,
      trim: true
  }, 
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number, 
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'  
    }
  },
  photo: String, 
  // video29 1:33 derfor kommenterte jeg den ut
  // author: {
  //   type: mongoose.Schema.ObjectId, //Double Check Your Case on ObjectId! (betyr at sjekk stor O og Stor I?)
  //   ref: 'User',
  //   required: 'You must supply a sketchNoter'
  // }
});

// Define your idexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

//Pre save hoook 
storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //skipt it
    return; //stop this function from running
  }
  this.slug = slug(this.name); 
  //find other stores that have a slug of we, wes-1, wes-2
  //TODO den over  
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length+1}`;
  }
  next();

});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } }},
    { $sort: { count: -1 } }
  ]);
};


module.exports = mongoose.model('Store', storeSchema);