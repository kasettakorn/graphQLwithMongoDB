import User from '../models/user'
import Product from '../models/product'

const Query = {
    user: (parent, args, {userId}, info) => {
        //Check if user logged in
        if (!userId) throw new Error('Please log in.')
        
 
        return User.findById(userId)
        .populate({
            path: "products",
            popolate: { path: "user" }
        })
        .populate({ path: "carts", populate: { path: "product" } })
    },
    users: (parent, args, context, info) => User.find({}).populate({
        path: 'products', 
        populate: {path: 'user'}
    }),
    product: (parent, args, context, info) => Product.findById(args.id).populate({
        path: 'user', 
        populate: {path: 'products'}
    }),
    products: (parent, args, context, info) => Product.find().populate({
        path: 'user', 
        populate: {path: 'products'}
    }).sort({price: 'desc'}),
}
export default Query