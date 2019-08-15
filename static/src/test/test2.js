Object.defineProperty(import.meta, 'test', {value: 123});
console.info('this script is', import.meta);

export default 'hello';