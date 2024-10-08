function encodeInteger(num) {
    return `i${num}e`;
  }
  
  function encodeString(str) {
    return `${str.length}:${str}`;
  }
  
  function encodeList(list) {
    return `l${list.map(encodeBencode).join('')}e`;
  }
  
  function encodeDictionary(dict) {
    return `d${Object.keys(dict)
      .sort()
      .map(key => `${encodeString(key)}${encodeBencode(dict[key])}`)
      .join('')}e`;
  }
  
  function encodeBencode(data) {
    if (typeof data === 'number') {
      return encodeInteger(data);
    } else if (typeof data === 'string') {
      return encodeString(data);
    } else if (Array.isArray(data)) {
      return encodeList(data);
    } else if (typeof data === 'object') {
      return encodeDictionary(data);
    }
  }
  