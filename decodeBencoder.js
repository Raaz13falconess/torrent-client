function decodeInteger(str, index) {
    const end = str.indexOf('e', index);
    const number = parseInt(str.substring(index + 1, end));
    return { value: number, nextIndex: end + 1 };
  }
  
  function decodeString(str, index) {
    const colon = str.indexOf(':', index);
    const length = parseInt(str.substring(index, colon));
    const value = str.substring(colon + 1, colon + 1 + length);
    return { value: value, nextIndex: colon + 1 + length };
  }
  
  function decodeList(str, index) {
    const list = [];
    index += 1;
    while (str[index] !== 'e') {
      const decoded = decodeBencode(str, index);
      list.push(decoded.value);
      index = decoded.nextIndex;
    }
    return { value: list, nextIndex: index + 1 };
  }
  
  function decodeDictionary(str, index) {
    const dict = {};
    index += 1;
    while (str[index] !== 'e') {
      const key = decodeString(str, index);
      const value = decodeBencode(str, key.nextIndex);
      dict[key.value] = value.value;
      index = value.nextIndex;
    }
    return { value: dict, nextIndex: index + 1 };
  }
  
  function decodeBencode(str, index = 0) {
    if (str[index] === 'i') {
      return decodeInteger(str, index);
    } else if (str[index] === 'l') {
      return decodeList(str, index);
    } else if (str[index] === 'd') {
      return decodeDictionary(str, index);
    } else {
      return decodeString(str, index);
    }
  }
  