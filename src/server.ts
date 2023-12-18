import "dotenv/config";
import { app } from "./app";




const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    
    console.log(`Listening on port ${PORT} for TaskMann`);

    // es.sendemail('kolade199@gmail.com', 'Test', 'Test').then((res) => console.log(res));
    // console.log('email', es.senduserregistrationemail("kolade199@yahoo.com", "http://localhost:3000", "John Doe").then((res) => console.log(res)));
    // es.senduserregistrationemailfake("johndoe@gmail", "http://localhost:3000", "John Doe");

});
