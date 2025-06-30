const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@job-carear.c9mdiyl.mongodb.net/?retryWrites=true&w=majority&appName=Job-Carear`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const newCollection = client.db('jobPortal').collection('jobs');
        const applicationCollection = client.db('applys').collection('apply');
       app.get('/jobs', async (req,res) => {
        const results = await newCollection.find().toArray();
        res.send(results);
       })

       app.get('/jobs/:id', async (req,res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const results = await newCollection.findOne(query);
        res.send(results);
       })

       //job apply 

       app.post('/application', async(req,res) => {
        const  application = req.body;
        const  result = await applicationCollection.insertOne(application);
        res.send(result);
       })



       //job applications 

       app.get('/applications', async (req,res) => {
        const email = req.query.email;
        const query = {
            applicant: email
        }
        const results = await applicationCollection.find(query).toArray();
        
        for(application of results){
            const jobId = application.jobId;
            const jobQuery = {_id: new ObjectId(jobId)}
            const job = await newCollection.findOne(jobQuery);
            application.company = job.company;
            application.title = job.title;
            application.company_logo = job.company_logo;
        }
        
        res.send(results);
       })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('job protal is runngin')

});


app.listen(port, () => {
    console.log(`Job portal is running ${port}`)
})