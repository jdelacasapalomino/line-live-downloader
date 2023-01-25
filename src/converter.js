import hbjs from "handbrake-js";
import * as fs from "fs";


const files = fs.readdirSync('data/ts')

for (const file of files) {
    await processFile(file)
}

function processFile(file) {
    const input = `data/ts/${file}`
    const output = `data/${file.replace(".ts", ".mp4")}`

    return new Promise((resolve, reject) => {
        hbjs.spawn({ input, output})
            .on('error', reject)
            .on('complete', resolve)
            .on('progress', progress => {
                console.log(
                    'Percent complete: %s, ETA: %s',
                    progress.percentComplete,
                    progress.eta
                )
            })
    })
}