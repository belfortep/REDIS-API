const express = require('express')
const axios = require('axios')
const { createClient } = require('redis')
const responseTime = require('response-time')

const app = express()

//esta es la conexion a redis
const client = createClient({
    host: '127.0.0.1',
    port: 6379,
})

app.use(responseTime())

app.get('/character', async (req, res, next) => {
    try {

        const reply = await client.get('character')//busca si esta la informacion en el cache de redis


        if (reply) return res.send(JSON.parse(reply))


        const response = await axios.get("https://rickandmortyapi.com/api/character")


        const saveResult = await client.set('character', JSON.stringify(response.data),
            { EX: 20, }//se guarda por esta X cantidad de tiempo en el cache
        )

        res.send(response.data)

    } catch (err) {

        console.log(err)

        res.send(err.message)

    }
})


app.get('/character/:id', async (req, res, next) => {
    try {

        const reply = await client.get(req.params.id)

        if (reply) {

            return res.send(JSON.parse(reply))

        }

        const response = await axios.get("https://rickandmortyapi.com/api/character/" + req.params.id)

        const saveResult = await client.set(req.params.id, JSON.stringify(response.data),
            { EX: 15, }
        )

        res.send(response.data)

    } catch (err) {

        console.log(err)

        res.send(err.message)

    }
})

async function main() {

    await client.connect()

    app.listen(3000)

    console.log('Server on port 3000')

}

main()