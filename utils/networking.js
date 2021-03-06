import axios from 'axios';
//import { v4 as uuidv4 } from 'uuid'

// Modify to test a local server
// const API_BASE = 'http://localhost:2354';
const API_BASE = 'https://node-1.zesty.market'
const METRICS_ENDPOINT = API_BASE + '/api/v1/metrics'

const AD_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-rinkeby'

//const sessionId = uuidv4();

const DEFAULT_AD_DATAS = {
  "uri": undefined,
}

const DEFAULT_AD_URI_CONTENT = {
  "name": "Default Ad",
  "description": "This is the default ad that would be displayed ipsum",
  "image": "https://assets.wonderleap.co/wonderleap-ad-2.png",
  "url": "https://wonderleap.co/"
}

/**
 * Queries The Graph to retrieve NFT information for the ad space.
 * @param {string} adSpace The ad space ID
 * @param {string} creator The wallet address of the creator
 * @returns An object with the requested ad space information, or a default if it cannot be retrieved.
 */
const fetchNFT = async (adSpace, creator) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return axios.post(AD_ENDPOINT, {
    query: `
      query {
        tokenDatas (
          where: {
            id: "${adSpace}"
            creator: "${creator}"
          }
        )
        { 
          sellerNFTSetting {
            sellerAuctions (
              first: 1
              where: {
                contractTimeStart_lte: ${currentTime}
                contractTimeEnd_gte: ${currentTime}
              }
            ) {
              id
              buyerCampaigns {
                id
                uri
              }
            }
          }
          id
        }
      }
    `
  })
  .then((res) => {
    if (res.status != 200) {
      return DEFAULT_AD_DATAS 
    }

    let sellerAuctions = res.data.data.tokenDatas[0]?.sellerNFTSetting?.sellerAuctions;
    let latestAuction = sellerAuctions[0]?.buyerCampaigns?.pop();
    
    if (latestAuction == null) {
        return DEFAULT_AD_DATAS 
    }

    return latestAuction;
  })
  .catch((err) => {
    console.log(err);
    return DEFAULT_AD_DATAS;
  })
};

/**
 * Pulls data from IPFS for the ad content.
 * @param {string} uri The IPFS URI containing the ad content.
 * @returns An object with the requested ad content, or a default if it cannot be retrieved.
 */
const fetchActiveAd = async (uri) => {
  if (!uri) {
    return { uri: 'DEFAULT_URI', data: DEFAULT_AD_URI_CONTENT }
  }

  return axios.get(`https://ipfs.zesty.market/ipfs/${uri}`)
  .then((res) => {
    return res.status == 200 ? { uri: uri, data: res.data } : null
  })
}

/**
 * !!! CURRENTLY DISABLED !!!
 * @param {string} creator The wallet address of the creator
 * @param {string} adSpace The ad space ID
 * @param {string} uri The IPFS URI for the ad space
 * @param {string} image The ad space image
 * @param {string} url URL for the ad space image
 * @param {*} event 
 * @param {Number} durationInMs Amount of time the ad was viewed
 * @param {string} sdkType The SDK this metric was sent from
 * @returns A Promise representing the POST request
 */
const sendMetric = (
  creator,
  adSpace,
  uri,
  image,
  url,
  event,
  durationInMs,
  sdkType
  ) => {
  /*
  const currentMs = Math.floor(Date.now());
  const config = {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    }
  }
  return axios.post(METRICS_ENDPOINT, {
    _id: uuidv4(),
    creator: creator,
    adSpace: adSpace,
    uri: uri,
    image: image,
    url: url,
    event: event,
    durationInMs: durationInMs,
    sessionId: sessionId,
    timestampInMs: currentMs,
    sdkVersion: 1,
    sdkType: sdkType,
  }, config)
  */
};

export { fetchNFT, fetchActiveAd, sendMetric };
