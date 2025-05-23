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
        required: true
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
        required: true
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
    location:{
        type: String,
        required: true
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