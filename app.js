document.getElementById('sign-form').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const text = document.getElementById('text-input').value;
    if (!text.trim()) {
      alert('Por favor, insira um texto válido!');
      return;
    }
  
    // Exibir o carregando enquanto processa
    document.getElementById('loading').style.display = 'block';
    
    try {
      // Gerar chaves e assinar o texto
      const { publicKey, privateKey } = await generateKeys();
      const signature = await signText(text, privateKey);
  
      // Exibir assinatura
      document.getElementById('signature-output').value = signature;
      document.getElementById('copy-signature').style.display = 'inline-block';
      
      // Verificar assinatura
      const isValid = await verifySignature(text, signature, publicKey);
      const verificationStatus = isValid ? 'A assinatura é válida.' : 'A assinatura NÃO é válida.';
      document.getElementById('verification-status').textContent = verificationStatus;
      document.getElementById('verify-result').style.display = 'block';
    } catch (error) {
      alert('Ocorreu um erro: ' + error.message);
    } finally {
      document.getElementById('loading').style.display = 'none';
    }
  });
  
  // Função para copiar assinatura para a área de transferência
  document.getElementById('copy-signature').addEventListener('click', function() {
    const signature = document.getElementById('signature-output');
    signature.select();
    document.execCommand('copy');
    alert('Assinatura copiada para a área de transferência!');
  });
  
  // Função para gerar as chaves públicas e privadas (RSA)
  async function generateKeys() {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
        hash: { name: "SHA-256" }
      },
      true,
      ["sign", "verify"]
    );
  
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };
  }
  
  // Função para assinar um texto
  async function signText(text, privateKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const signature = await window.crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      privateKey,
      data
    );
    
    return bufferToBase64(signature);
  }
  
  // Função para verificar a assinatura
  async function verifySignature(text, signature, publicKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const signatureBuffer = base64ToBuffer(signature);
  
    const isValid = await window.crypto.subtle.verify(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      publicKey,
      signatureBuffer,
      data
    );
    
    return isValid;
  }
  
  // Função para converter buffer para base64
  function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  // Função para converter base64 para buffer
  function base64ToBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  