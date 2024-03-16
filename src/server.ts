import { Server } from 'http'
import app from './app'

const main =async ()=>{
const port = 5000
try{
const server : Server = app.listen(port,()=>{
    console.log('Server listening on port: ',port)
})

}catch(e){
    console.log(e)
}

}
main()