// the below code works same 
const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((error)=>next(error))
    }
}

export {asyncHandler}


// const asyncHandler = (fn)=>{   below is the short method to write this code
//     ()=>{
        
//     }
// }

// It is the wrapper code
/*
const asyncHandler = (fn)=>async(req,res,next)=>{
    try{
        await fn(req,res,next);
    }catch(error){
        res.status(error.code || 500)
        .json({
            success: false,
            message: error.message
        })
    }
}   */