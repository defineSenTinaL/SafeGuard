
/**
 * Global abu object
 */
var abu = (function () { 

    /**
     * This function allows cache property in object. Use with javascript getter.
     *
     * var Object = {
     *
     *      get someProperty(){
     *          return abu.lazyGet(Object, 'someProperty', function() {
     *              return calculateSomeProperty();
     *          });
     *      }
     * }
     *
     * @param object Object
     * @param prop Original property name
     * @param calculateFunc Calculation function
     * @returns {*}
     */
    var lazyGet = function (object, prop, calculateFunc) {
        var cachedProp = '_' + prop;
        if (cachedProp in object) {
            return object[cachedProp];
        }
        var value = calculateFunc.apply(object);
        object[cachedProp] = value;
        return value;
    };

    /**
     * Clear cached property
     * @param object Object
     * @param prop Original property name
     */
    var lazyGetClear = function (object, prop) {
        delete object['_' + prop];
    };

    return {
        lazyGet: lazyGet,
        lazyGetClear: lazyGetClear
    };

})();