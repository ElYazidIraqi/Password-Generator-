// Modernized script for password generator + table persistence + copy
(function(){
    const min = "abcdefghijklmnopqrstuvwxyz";
    const maj = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const chif = "0123456789";
    const carspecial = "%!&*^()#$:;?@[]{}<>";
  
    const form = document.getElementById('addPWD') || document.querySelector('form[name="ajoutPWD"]');
    const table = document.getElementById('tableau');
    const resultBox = document.getElementById('resultBox');
    const copyBtn = document.getElementById('copyPwd');
  
    // Load saved entries from localStorage
    function loadEntries(){
      const saved = JSON.parse(localStorage.getItem('pwd_entries') || '[]');
      saved.forEach(addRowToTable);
    }
  
    function saveEntry(entry){
      const arr = JSON.parse(localStorage.getItem('pwd_entries') || '[]');
      arr.push(entry);
      localStorage.setItem('pwd_entries', JSON.stringify(arr));
    }
  
    function addRowToTable(entry){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${entry.length}</td>
        <td>${entry.date}</td>
        <td>${entry.cat}</td>
        <td>${entry.site}</td>
        <td style="font-family: monospace;">${entry.pwd}</td>
        <td><button class="btn btn-ghost" data-action="copy">Copier</button> <button class="btn btn-ghost" data-action="del">Supprimer</button></td>
      `;
      table.querySelector('tbody').appendChild(tr);
  
      // buttons delegation
      tr.querySelector('[data-action="copy"]').addEventListener('click', ()=>{
        navigator.clipboard && navigator.clipboard.writeText(entry.pwd);
        alert('Mot de passe copié dans le presse-papiers');
      });
      tr.querySelector('[data-action="del"]').addEventListener('click', ()=>{
        tr.remove();
        removeSaved(entry);
      });
    }
  
    function removeSaved(entry){
      const arr = JSON.parse(localStorage.getItem('pwd_entries') || '[]');
      const idx = arr.findIndex(e => e.pwd === entry.pwd && e.site === entry.site && e.date === entry.date && e.length == entry.length);
      if(idx > -1){
        arr.splice(idx,1);
        localStorage.setItem('pwd_entries', JSON.stringify(arr));
      }
    }
  
    // Generate one password given a charset and length
    function makePassword(charset, length){
      let out = '';
      for(let i=0;i<length;i++){
        const r = Math.floor(Math.random() * charset.length);
        out += charset.charAt(r);
      }
      return out;
    }
  
    function validateAndGenerate(){
      const checkmin = document.getElementById('minuscule').checked;
      const checkmaj = document.getElementById('majuscule').checked;
      const checkchif = document.getElementById('chiffre').checked;
      const checksym = document.getElementById('symbole').checked;
      const nombre = Number(document.getElementById('nombre').value) || 0;
      const datevalid = document.getElementById('date').value;
      const cat = document.getElementById('cat').value;
      const siteapp = document.getElementById('siteorapp').value.trim();
  
      if(! (checkmin || checkmaj || checkchif || checksym) ){
        alert('Sélectionne au moins un type de caractère.');
        return;
      }
      if(nombre < 4 || nombre > 1000){
        alert('Choisis un nombre de caractères entre 4 et 1000.');
        return;
      }
      if(!datevalid || !cat || !siteapp){
        alert('Remplis la date, la catégorie et le nom du site/application.');
        return;
      }
  
      let charset = '';
      if(checkmin) charset += min;
      if(checkmaj) charset += maj;
      if(checkchif) charset += chif;
      if(checksym) charset += carspecial;
  
      // attempt generation ensuring at least one required type present
      let pwd = '';
      const maxAttempts = 50;
      let attempts = 0;
      do {
        pwd = makePassword(charset, nombre);
        attempts++;
        if(attempts > maxAttempts) break;
      } while( (checkmin && !/[a-z]/.test(pwd)) ||
               (checkmaj && !/[A-Z]/.test(pwd)) ||
               (checkchif && !/\d/.test(pwd)) ||
               (checksym && !/[%!&*^()#$:;?@[\]{}<>]/.test(pwd)) );
  
      // display result & save
      if(resultBox){
        document.getElementById('pwdText').textContent = pwd;
        resultBox.style.display = 'flex';
      }
      const entry = { length: nombre, date: datevalid, cat: cat, site: siteapp, pwd: pwd };
      addRowToTable(entry);
      saveEntry(entry);
    }
  
    // copy current result
    if(copyBtn){
      copyBtn.addEventListener('click', ()=>{
        const text = document.getElementById('pwdText').textContent;
        if(text){
          navigator.clipboard && navigator.clipboard.writeText(text);
          alert('Mot de passe copié');
        }
      });
    }
  
    // attach generate button
    const btnGen = document.getElementById('ajt');
    if(btnGen){
      btnGen.addEventListener('click', validateAndGenerate);
    }
  
    // clear table button (optional)
    const btnClear = document.getElementById('clearAll');
    if(btnClear){
      btnClear.addEventListener('click', ()=>{
        if(confirm('Supprimer toutes les entrées sauvegardées ?')){
          localStorage.removeItem('pwd_entries');
          const tbody = table.querySelector('tbody');
          tbody.innerHTML = '';
        }
      });
    }
  
    // load initial
    loadEntries();
  
  })();
  