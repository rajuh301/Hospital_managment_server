const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


// meddleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.tfb4xbn.mongodb.net/?retryWrites=true&w=majority`;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // connection--------------------
        const usersCollection = client.db("hospitalManagment").collection("users");
        const pasentCollection = client.db("hospitalManagment").collection("pasent");
        const cashCollection = client.db("hospitalManagment").collection("cash");
        const testChargeCollection = client.db("hospitalManagment").collection("testCharge");
        const doctorCollection = client.db("hospitalManagment").collection("doctor");
        const testCollection = client.db("hospitalManagment").collection("test");

        // connection--------------------


        // --------------------------- Content----------------------
        // ---------------------- user Releted api----------------------

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            console.log('ExistingUser', existingUser)

            if (existingUser) {
                return res.send({ message: 'User alerady exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.roal === 'admin' }
            res.send(result);
        })

        app.get('/users/register/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { register: user?.roal === 'register' }
            res.send(result);
        })

        app.get('/users/doctor/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { doctor: user?.roal === 'doctor' }
            res.send(result);
        })

        app.get('/users/phermacy/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { phermacy: user?.roal === 'pharmacy' }
            res.send(result);
        })

        app.get('/users/pathology/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { phermacy: user?.roal === 'pathology' }
            res.send(result);
        })


        app.patch('/users/:id', async (req, res) => {
            const userId = req.params.id;
            const { roal } = req.body;

            try {
                const user = await usersCollection.findOneAndUpdate(
                    { _id: new ObjectId(userId) },
                    { $set: { roal } },
                    { returnOriginal: false }
                );

                if (!user.value) {
                    return res.status(404).json({ message: 'User not found' });
                }

                res.json(user.value);
            } catch (error) {
                res.status(500).json({ message: 'Error updating role' });
            }
        });



        // ---------------------- user Releted api----------------------



        // ------------------------ Pasent Releted Api----------------
        app.post('/addPasent', async (req, res) => {
            const addPasent = req.body;
            const result = await pasentCollection.insertOne(addPasent);
            res.send(result);
        })

        app.get('/pasent', async (req, res) => {
            const result = await pasentCollection.find().toArray();
            res.send(result);
        })




        app.patch('/pasent/:id', (req, res) => {
            const { id } = req.params;
            const { data, timestamp } = req.body;

            const foundData = pasentCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $push: {
                        prediction: {
                            timestamp: new Date().toISOString(),
                            data
                        }
                    }
                }
            );

            foundData.Prediction = data;
            res.json({ message: 'Prediction updated successfully', updatedData: foundData });
        });


        app.get("/viewData/:_id", async (req, res) => {
            try {
                const id = req.params.id;
                console.log(id);
                const query = { _id: new ObjectId(id) };

                const result = await pasentCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });

        app.patch('/updateTest/:id/:index', (req, res) => {
            const { id, index } = req.params;
            const { data } = req.body; // Expect 'data' field in the request body
        
            pasentCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $push: {
                        [`test.${index}.report`]: data // Push 'data' into 'species' within the 'test' array at the specified index
                    }
                },
                { new: true }, // To get the updated document
                (err, updatedData) => {
                    if (err) {
                        res.status(500).json({ message: 'Error updating data' });
                    } else {
                        res.json({ message: 'Species updated successfully', updatedData });
                    }
                }
            );
        });
        
        
        
        // ------------------------ Pasent Releted Api----------------

        // ---------------------- Admin Releted Api--------------------


        // --------------------- Cash Releted Api -------------------

        app.post('/cashout', async (req, res) => {
            const cashOut = req.body;
            const timestamp = new Date();
            cashOut.timestamp = timestamp;
            const result = await cashCollection.insertOne(cashOut);
            res.send(result);
        })

        app.post('/testCharge', async (req, res) => {
            const testCharge = req.body;
            const timestamp = new Date();
            testCharge.timestamp = timestamp;
            const result = await testChargeCollection.insertOne(testCharge);
            res.send(result);
        })



        app.get('/testCharge', async (req, res) => {
            const result = await testChargeCollection.find().toArray();
            res.send(result);
        })


        app.get('/cashout', async (req, res) => {
            const result = await cashCollection.find().toArray();
            res.send(result);
        })



        app.patch('/cashout/:id', async (req, res) => {
            const cashId = req.params.id;
            const { salary } = req.body;

            try {
                const salarys = await usersCollection.findOneAndUpdate(
                    { _id: new ObjectId(cashId) },


                    {
                        $push: {
                            Salary: {
                                timestamp: new Date().toISOString(),
                                salary
                            }
                        }
                    },

                );
                salarys.salary = data;
                res.json({ message: 'Prediction updated successfully', updatedData: foundData });

                if (!salarys.value) {
                    return res.status(404).json({ message: 'Salary not found' });
                }

                res.json(user.value);
            } catch (error) {
                res.status(500).json({ message: 'Error updating Salary' });
            }
        });



        // --------------------- Cash Releted Api -------------------


        // ---------------------------- Doctor Area-----------------------

        app.post('/addDoctor', async (req, res) => {
            const addDoctor = req.body;
            const timestamp = new Date();
            addDoctor.timestamp = timestamp;
            const result = await doctorCollection.insertOne(addDoctor);
            res.send(result);
        })

        app.get('/doctors', async (req, res) => {
            const result = await doctorCollection.find().toArray();
            res.send(result);
        })

        // ---------------------------- Doctor Area-----------------------

        // ------------------ test Area ----------------
        app.post('/addTest', async (req, res) => {
            const addTest = req.body;
            const timestamp = new Date();
            addTest.timestamp = timestamp;
            const result = await testCollection.insertOne(addTest);
            res.send(result);
        })


        app.get('/addTest', async (req, res) => {
            const result = await testCollection.find().toArray();
            res.send(result);
        })


        app.patch('/tests/:id', async (req, res) => {
            const cashId = req.params.id;
            const testsToUpdate = req.body; // Array of objects with { testName, inputValue }

            try {
                const updatedTests = [];

                for (const test of testsToUpdate) {
                    const updatedTest = {
                        timestamp: new Date().toISOString(),
                        test: test.testName, // Ensure the structure matches your database
                        inputValue: test.inputValue, // Add the inputValue to the database
                        charge: test.price,

                    };

                    const tested = await pasentCollection.findOneAndUpdate(
                        { _id: new ObjectId(cashId) },
                        { $push: { test: updatedTest } },
                        { new: true }
                    );

                    if (!tested) {
                        return res.status(404).json({ message: 'Test not found' });
                    }

                    updatedTests.push(tested);
                }

                res.json({ message: 'Tests updated successfully', updatedData: updatedTests });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error updating Tests' });
            }
        });






        // ------------------ test Area ----------------

        // ---------------------- Admin Releted Api--------------------



        // --------------------------- Content----------------------



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Hospital Server is running');
})

app.listen(port, () => {
    console.log(`Hospital is running on port: ${port}`)
})