const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const specimenSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    genus: {
        type: String,
        required: true
    },
    species: {
        type: String,
        required: true
    },
    nickName: {
        type: String,
        required: false
    },
    specimenId: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: false
    },
    manufacturerId: {
        type: String,
        required: false
    },
    manufacturer: {
        type: String,
        required: false
    },
    countryManufactured: {
        type: String,
        required: false
    },
    anthropologist: {
        type: String,
        required: false
    },
    activeValue: {
        type: Number,
        required: false
    },
    paidValue: {
        type: Number,
        required: false
    },
    dateOfPurchase: {
        type: String,
        required: false
    },
    purchaser: {
        type: String,
        required: false
    },
    regionFound:{
        type: String,
        required: false
    },
    countryFound:{
        type: String,
        required: false
    },
    location: {
        cabinet: {
            type: String,
            enum: ['Cabinet 1', 'Cabinet 2', 'Cabinet 3', 'Cabinet 4', 'Cabinet 5', 
                   'Cabinet 6', 'Cabinet 7', 'Cabinet 8', 'Cabinet 9', 'Cabinet 10'],
            default: null
        },
        shelf: {
            type: String,
            enum: ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5', 'Shelf 6'],
            default: null
        },
        drawer: {
            type: String,
            enum: ['Drawer 1', 'Drawer 2', 'Drawer 3', 'Drawer 4', 'Drawer 5', 'Drawer 6',
                   'Drawer 7', 'Drawer 8', 'Drawer 9', 'Drawer 10', 'Drawer 11', 'Drawer 12'],
            default: null
        },
        validate: {
            validator: function(location) {
                if (!location) return true  // Location is optional
                if (!location.cabinet) return false  // Cabinet is required if location exists
                
                // Must have either shelf OR drawer, not both
                const hasShelf = location.shelf && location.shelf.trim() !== ''
                const hasDrawer = location.drawer && location.drawer.trim() !== ''
                
                return (hasShelf && !hasDrawer) || (hasDrawer && !hasShelf)
            },
            message: 'Location must have either shelf or drawer, not both. Cabinet is required.'
        }
    },
    description:{
        type: String,
        required: false
    },
    notes:{
        type: String,
        required: false
    },
    images: [{type: String}] // array containing relative image paths

}, { timestamps: true });

const Specimen = mongoose.model('Specimen', specimenSchema);

module.exports = Specimen;