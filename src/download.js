import * as fs from 'fs'
import fetch from 'node-fetch'
import minyami from 'minyami';

const { ArchiveDownloader } = minyami;

async function init() {
    const videos = fs.readFileSync('data/videos.txt')
        .toString()
        .trim()
        .split('\n')

    const videoIds = videos.map(video => video.split('/').pop())
    const channelId = videos[0].split('/')[4]
    const videoUrls = videoIds.map(id => `https://live-api.line-apps.com/web/v4.0/channel/${channelId}/broadcast/${id}`)

    const videoMediaRequests = await Promise.all(videoUrls.map((url) => fetch(url)))
    const videoMedias = await Promise.all(videoMediaRequests.map(result => result.json()))
    const videoStreamingUrls = videoMedias.map(media => {
        const url = media['archivedHLSURLs']['720']
            || media['archivedHLSURLs']['480']
            || media['archivedHLSURLs']['360']
            || media['archivedHLSURLs']['240']
            || media['archivedHLSURLs']['144']

        return {
            url,
            title: media['item']['title'],
            date: media['item']['finishedBroadcastingAt']
        }
    })

    for (const data of videoStreamingUrls) {
        console.log(data);
        await downloadVideo(data);
    }
}

async function downloadVideo({title, url, date}) {
    const dir = './data/ts';
    const output = `data/ts/${date}_${title}.ts`

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    return new Promise(async (resolve) => {
        const downloader = new ArchiveDownloader(url, {
            output,
            verbose: true,
            threads: 12,
        });

        await downloader.init()
        await downloader.download() // startDownload*

        downloader.on('finished', async () => {
            await downloader.clean()
            resolve()
        })
    })
}

init()
