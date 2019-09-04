
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

  for (const key in config['audio']) {
    const def = config['audio'][key];
    if (def.type !== 'AudioSource') {
      console.debug('cowardly skipping', def.type, 'id', key);
      continue;
    }

    const {
      file_id: fileId,
      retrig,
      destination_name: dest,
      volume,
      volume_start_range: volumeStartRange,
      volume_end_range: volumeEndRange,
      loop,
      loop_start: loopStart,
      loop_end: loopEnd,
      metaData: metadata,
    } = def;

    const file = rawFiles[fileId];


    console.info('got audio', key, 'maps to file', fileId);
  }

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


  return (name) => {
    const process = config['events'][name] || name;
    const processDef = config['processes'][process];
    if (def === undefined) {
      console.warn('got bad name', name);
      return false;
    }

    const me = {};
    processDef['vars'].forEach((key) => {
      const audioDef = config['audio'];

      if (audioDef.type !== 'AudioSource') {
        throw new Error('unhandled');
      }
    });
  }
}

