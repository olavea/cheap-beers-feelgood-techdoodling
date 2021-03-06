const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


exports.homePage = (req, res) => {
  res.render('index');
}; 

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add Your feelGood sketchNote' });
};

exports.createStore = async (req, res) => { //er på kodelinje 45 hos wesbos i video 29
    // video29 2:56 derfor kommenterte jeg den ut
    // req.body.author = req.user._id;
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
    // 1. Query the database for a list of all stores
    const stores = await Store.find();
    //console.log(stores);
    res.render('stores', { title: 'Pubs', stores });
};
// video29 6:33 derfor kommenterte jeg den ut
// const confirmOwner = (store, user) => { //video 29
//     if(!store.author.equals(user._id)) { //|| user.level < 10 ) { //video 29
//         throw Error('You must own this sketchNote location to edit it!'); //video 29
//     }
// };

exports.editStore = async (req, res) => {
    //1, find the store given the ID
    const store = await Store.findOne({ _id: req.params.id });
    
    //2, Confirm they are the owner of the store
    // video29 7:46 derfor kommenterte jeg den ut
    // confirmOwner(store, req.user); //video 29
    //3. Render out the edit form so the user can update their store
    
    res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
    // Set the location to be a point
    req.body.location.type = 'Point';
       //find and update the store: Store.findOneAndUpdate({ query, data, options }) 
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, //return the new store instead of the old one
        runValidators: true
    }).exec();
    // redirect them the store and tell them it worked
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Store -></a>`);
    res.redirect(`/stores/${store._id}/edit`);
};

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next){
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto){
            next(null, true);
        } else {
            next({ message: 'That filetype isn´t allowed'}, false);        
        }
    }
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    //Check if there is no new file to resize
    if(!req.file) {
        next(); //skip to the next middleware
        return;
    };
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    //now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    //once we have written the photo to our filesystem, keep going!
    next();
}; 

exports.getStoreBySlug = async (req, res, next) => {  
    const store = await Store.findOne({ slug: req.params.slug });
    //   populate('author'); //video29
    // video29 4:44 derfor kommenterte jeg den ut
    if (!store) return next();
    res.render('store', { store, title: store.name });            
};

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    res.render('tag', { tags, title: 'Tags', tag, stores });
    
};

exports.searchStores = async (req, res) =>{
    const stores = await Store
    // first find stores that match
    .find({
        $text: {
            $search: req.query.q
        }
    },      {
        score: { $meta: 'textScore' }
    })
    // then sort them
    .sort({
      score: { $meta: 'textScore'}
    })
    //limit to only 5 results
    .limit(5);
    res.json(stores);
};