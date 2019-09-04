
import {_static} from './magic.js';


const configPath = _static`third_party/lib/klang/config.js`;
const audioPath = _static`audio`;


export async function prepare() {
  // Load the config into the page (dynamically), as it's ~300kb and doesn't need to be loaded
  // unless the user is actually playing audio. It just creates the `KLANG_CONFIG` global.

  const config = await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = configPath;
    script.onload = () => resolve(window['KLANG_CONFIG']);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  // Audio files aren't keyed, they just have an ID field.
  const rawFiles = {};
  config['files'].forEach((all) => rawFiles[all['id']] = all);

  // const preload = {};
  // config['files'].forEach(({id, url, load_group: group, audio_tag: tagOk}) => {
  //   files[id] = url;
  //   // TODO: we also get audio_tag, which, if missing, prevents load in audioTag environment
  //   // ... could just not insert the audio file here

  //   let s = preload[group];
  //   if (s === undefined) {
  //     s = preload[group] = new Set();
  //   }
  //   s.add(id);
  // });

  const audio = {};
  const preload = {};

  for (const key in config['audio']) {
    const def = config['audio'][key];
    if (def.type !== 'AudioSource') {
      console.debug('cowardly skipping', def.type, 'id', key);
      continue;
    }

    const {
      file_id: fileId,
      retrig,  // if true, can play many times (e.g. sound effect?)
      destination_name: dest,
      volume,
      volume_start_range: volumeStartRange,  // random variance
      volume_end_range: volumeEndRange,
      pitch_start_range: pitchStartRange,
      pitch_end_range: pitchEndRange,
      playback_rate: playbackRate,  // fixed rate to playback at
      offset: offset,  // nb. literally used once
      loop,
      loop_start: loopStart,
      loop_end: loopEnd,
      metaData: metadata,
    } = def;

    if (retrig && loop && !loopEnd) {
      // ... this is probably an omission in the source data, since this would let you play this
      // audio infinite times, without an end
      // There's only three of these in the config.
    }

    // In rare occasions, the same audio definition can point to the same file (e.g., with a
    // different playback rate).
    const file = rawFiles[fileId];
    const loadGroup = file['load_group'];
    let m = preload[loadGroup];
    if (m === undefined) {
      m = preload[loadGroup] = new Map();
    }
    m.set(key, file['url']);

    audio[key] = {
      fileId,
    };
  }
  console.debug('got', Object.keys(preload).length, 'preload groups');

  const masterBus = config['masterBus'];
  for (const bus in config['busses']) {
    // roughly maps to nodes in AudioContext
  }

  // TODO: probably for codeboogie etc
  const sequencers = config['sequencers'];

  // same "namespace" as audio files?
  const processes = config['processes'];

  // just gives friendly names to processes (_maybe_ audio files?)
  const events = config['events'];

  const nodes = {};

  return {
    async preload(group) {
      console.warn('got preload', group, preload[group]);

      preload[group].forEach((file, key) => {
        // TODO: ogg vs mp3
        const url = `${audioPath}/${file}.ogg`;
        const audio = new Audio();
        audio.src = url;
        console.info('preloading', audio);
        nodes[key] = audio;
        // TODO: pull audio from Audio even if it's a file source
      });

    },
    play(event) {
      console.warn('got play', event);

      // TODO: stuff
    },
  };


  // return (name) => {
  //   const process = config['events'][name] || name;
  //   const processDef = config['processes'][process];
  //   if (processDef === undefined) {
  //     console.warn('got bad name', name);
  //     return false;
  //   }

  //   const me = {};
  //   processDef['vars'].forEach((key) => {
  //     const audioDef = audio[key];
  //     me[key] = {
  //       play(when) {
  //         const 
  //       },
  //     }

  //     console.info('key', key);
  //     const audioDef = config['audio'];

  //     if (audioDef.type !== 'AudioSource') {
  //       throw new Error('unhandled');
  //     }
  //   });
  // }
}

