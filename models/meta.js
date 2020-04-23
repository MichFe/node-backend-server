var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var unidadesDeNegocio = {
    values: [
        'Fabrica',
        'Tienda León',
        'Tienda Guadalajara',
        'Expo GDL',
        'Expo CDMX',
        'Imbra'
    ],
    message: '{VALUE} no es una unidad de negocio válida'
};

var metaSchema = new Schema({
    year: { type: Number, required: true },
    unidadDeNegocio: { type: String, required: true, enum: unidadesDeNegocio },
    metas: []
});

module.exports = mongoose.model('Meta', metaSchema); 