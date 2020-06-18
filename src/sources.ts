import fetch from "node-fetch";

export const nimiqx = async (url: string) => {
  try {
    const request = await fetch(url + '?api_key=' + process.env.NIMIQX_TOKEN);
    return await request.json()
  } catch (error) {
    console.log(error.message)
  }
}

export const nimiqWatch = async (url: string) => {
  try {
    const request = await fetch(url);
    return await request.json()
  } catch (error) {
    console.log(error.message)
  }
}