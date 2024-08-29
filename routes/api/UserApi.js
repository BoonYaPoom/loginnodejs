const express = require('express')
const router = express.Router()
const users = require('../../users')
const uuid = require('uuid')

//get user all
router.get('/',(req,res) => res.json(users))
//get user single
router.get('/:id',(req,res) => {
    //some คือการเช็คว่ามีหรือไม่
    let found = users.some(user => user.id === parseInt(req.params.id))
    if(found){
        res.json(users.filter(user => user.id === parseInt(req.params.id)))
    }else{
         res.status(400).json({msg:'no id'})
    }
   
})

//create users
router.post('/', (req, res) => {
    const newUser = {
        id: uuid.v4(),
        name: req.body.name,
        email: req.body.email
    }

    if(!newUser.name || !newUser.email){
        return res.status(400).json({msg: "no user or email"})
    }
    users.push(newUser)
    res.json(users)
})

//update
router.put('/:id',(req,res) => {
    //some คือการเช็คว่ามีหรือไม่
    let found = users.some(user => user.id === parseInt(req.params.id))
    if(found){
        const upUser = req.body
        users.forEach(user => {
            if(user.id === parseInt(req.params.id)){
                user.name = upUser.name ? upUser.name : user.name
                user.email = upUser.email ? upUser.email : user.email

                res.json({msg: "user update", user})
            }
        })
    }else{
         res.status(400).json({msg:'no id '})
    }
   
})

//delete
router.delete('/:id',(req,res) =>{
    let found = users.some(user => user.id === parseInt(req.params.id))
    if(found){
        res.json({
            msg: "user delete", 
            user: users.filter(user => user.id !== parseInt(req.params.id))
        })
    }else{
         res.status(400).json({msg:'no id '})
    }
})


module.exports = router