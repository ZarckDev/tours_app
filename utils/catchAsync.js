
// remove the try catch .. of all Controller functions, instead create a function that will wrap everything
// fn is a async function then
module.exports = fn => {
    return (req, res, next) => { // return an anonymous function
        fn(req, res, next).catch(err => next(err)) // catch is available on all Promises, that's why we can use it, becaut fn is an async, so returns a Promise
    }
}