// CLASS FOR REUSABLE FILTERING
class APIFeatures {
    constructor(query, queryString) {// query to be reusable in other models
        this.query = query;
        this.queryString = queryString;
    }

    //1a) FILTERING
    filter() {
        // Extract page, sort, limit, fileds from queryString
        const { page, sort, limit, fields, ...queryObj } = this.queryString;

        //1b) ADVANCED FILTERING
        // /api/v1/tours?difficulty=easy&duration[gte]=5
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // match one of the gte, gt, lte, lt words -- "\b" to match the EXACT words, g for multiple times possible

        // this.query could be Tour query
        this.query = this.query.find(JSON.parse(queryStr)); 

        return this; // for chaining ! return the object
    }

    //2) SORTING
    sort() {
        const { sort } = this.queryString; // extract sort from queryString
        // ex : /api/v1/tours?sort=price
        // ex 2 : /api/v1/tours?sort=-price   => descending order
        if(sort) {
            // ordering in case there is a tie -- same value
            // /api/v1/tours?sort=price,ratingsAverage
            // sort('price ratingsAverage') // add a second field
            const sortBy = sort.split(',').join(' '); // replace with space for mongoose

            this.query = this.query.sort(sortBy)
        } else { // user does not specify sort string
            this.query = this.query.sort('-createdAt') // sort anyway with last created first // !!!!!!! Cause problem in page & limit !!!!!!!! Because everything as the same time and date
        }
        return this; // for chaining ! return the object
    }

    //3) FIELD LIMITING
    limitFields(){
        const { fields } = this.queryString; // extract fields from queryString
        // ex : /api/v1/tours?fields=name,duration,difficulty,price
        // ex 2 : /api/v1/tours?fields=-name,-duration  (everything excepts name and duration)
        if(fields) {
            const selectedFields = fields.split(',').join(' ');
            // wait for 'name duration ...'
            this.query = this.query.select(selectedFields)
        } else {
            // if we don't have the fields, just do not show the '__v' in the API.
            this.query = this.query.select('-__v'); // We take everything excepts "__v" field thanks to the "-"
        }
        return this; // for chaining ! return the object
    }

    //4) PAGINATION (when 1000 documents for example)
    paginate(){
        const { page, limit } = this.queryString; // extract page and limit from queryString
        // ex: /api/v1/tours?page=2&limit=10  ==> displaying page nb 2 with 10 documents max per page
        // in this case =>  1-10: page 1, 11-20: page 2, 21-30: page 3 .....
        const pageNb = page * 1 || 1; // convert to number || page 1 by default -- we by default limit, if one day we have 1000 documents...
        const limitSet = limit * 1 || 100; // 100 documents limit by page by default
        const skipValue = (pageNb - 1) * limitSet;
        // query = query.skip(10).limit(10); // skip amount of results that will be skiped
        this.query = this.query.skip(skipValue).limit(limitSet);

        return this; // for chaining ! return the object
    }
}

module.exports = APIFeatures;