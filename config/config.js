module.exports.SEED = '@Mobla-Core-Software@MFP1-7';

//-------------------
// Production config
//-------------------

// module.exports.CORS_OPTIONS = {
//   origin: ["https://moblacore.com"],
//   optionsSuccessStatus: 200
// };

// module.exports.UPLOADS_PATH =
//   "/Users/PascualMichelle/Desktop/Consultoria CHR/Mobla/CoreSoftware/src/assets/images/uploads/";


//-----------------------------
// End of Production config
//-----------------------------

//------------------------
// Development Config
//------------------------

module.exports.CORS_OPTIONS = {
  origin: ["http://localhost:4200"],
  optionsSuccessStatus: 200
};

// module.exports.UPLOADS_PATH =
//   "/Users/PascualMichelle/Desktop/Consultoria CHR/Mobla/CoreSoftware/src/assets/images/uploads/";

  module.exports.UPLOADS_PATH="uploads/";

//----------------------------
// End of Development Config
//----------------------------