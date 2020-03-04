const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/taks-manager-api', {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useFindAndModify : false
});
mongoose.set('useCreateIndex', true);

