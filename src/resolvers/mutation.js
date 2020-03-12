import User from '../models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Product from '../models/product'
import CartItem from '../models/cartItem'

const Mutation = {
    signup: async (parent, args, context, info) =>  {
        //Trim and lower case email
        const email = args.email.trim().toLowerCase()
        //Check if email already exist in database
        const currentUser = await User.find({})
        const isEmailExist = currentUser.findIndex(user => user.email === email) > -1
        
        if(isEmailExist) {
            throw new Error('Email already exist.')
        }
        //validate password
        if(args.password.trim().length < 6) {
            throw new Error('Password must be at least 6 characters.')
        }
        const password = await bcrypt.hash(args.password, 10)
        return User.create({...args, email, password})   
    },
    login: async(parent, args, context, info) => {
        const { email, password } = args
        //Find user in database
        const user = await User.findOne({email})
        .populate({
            path: "products",
            popolate: { path: "user" }
        })
        .populate({ path: "carts", populate: { path: "product" } })
        
        if(!user) throw new Error('Email not found, please sign up.')
        
        // Check if password is correct
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) throw new Error('Invalid email or password.')
        
        // Create token jwt
        const token = jwt.sign({userId: user.id}, process.env.SECRET, {expiresIn: '7days'})
        
        return { user: user, jwt: token }
    },
    createProduct: async (parent, args, {userId}, info) => {
        //Check if user logged in
        if(!userId) throw new Error('Please log in.')
        
        if(!args.description || !args.price || !args.imageUrl) {
            throw new Error('Please provide all required fields.')
        }
        const product = await Product.create({...args, user: userId})
        const user = await User.findById(userId)
        
        if(!user.products) {
            user.products = [product]
        }
        else {
            user.products.push(product)
        }
        await user.save()
        return Product.findById(product.id).populate({
            path: 'user', 
            populate: { path: 'products' }
        })
    },
    addToCart: async (parent, args, context, info) => {
        // id --> productId
        const { id } = args
        
        try {
            // Find user who perform add to cart --> from logged in
            const userId = "5e6882a7f1e5ce11dc12a386"
            
            // Check if the new addToCart item is already in user cart
            const user = await User.findById(userId).populate({
                path: 'carts', 
                populate: {path: "product"}
            })

            
            const findCartItemIndex = user.carts.findIndex(cartItem => cartItem.product.id === id)
            
            if (findCartItemIndex > -1) {
                //A. The new addToCart item is already in cart
                //A.1 Find the cartItem and update in database
                user.carts[findCartItemIndex].quantity += 1
                await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
                    quantity: user.carts[findCartItemIndex].quantity
                })
                //A.2 Find update cartItem  
                const updateCartItem = await CartItem.findById(user.carts[findCartItemIndex].id)
                    .populate({path: 'product'})
                    .populate({path: 'user'})
                return updateCartItem
            }
            else {
                //B. The new addToCart item isn't in cart yet
                //B.1 Create new cartItem
                const cartItem = await CartItem.create({
                    product: id,
                    quantity: 1,
                    user: userId,
                
                })
                
                //B.2 Find new cartItem
                const newCartItem = await CartItem.findById(cartItem.id)
                    .populate({ path: 'product' })
                    .populate({ path: 'user' })
                //B.3 Update user.carts   
                await User.findByIdAndUpdate(userId, {carts: [...user.carts, newCartItem]})     
                return newCartItem
            }
            
            

        } catch (error) {
            console.log(error);
            
        }
    }
}
export default Mutation