import { Server } from 'http'
import app from './app'
import config from './app/config'

const main =async ()=>{

try{
const server : Server = app.listen(config.PORT,()=>{
    console.log('Server listening on port: ',config.PORT)
})

}catch(e){
    console.log(e)
}

}
main()