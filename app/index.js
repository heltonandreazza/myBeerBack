'use strict';

module.exports = {
    router: require('./routes')(),
    session: require('./sessions'),
    logger: require('./logger'),
    utils: {
        cartLength: require('./utils/cartLength'),
        checkToken: require('./utils/checkToken')
    }
}