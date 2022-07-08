app.controller('MyController', function ($scope, $window) {
    $scope.search = '';
    $scope.date = new Date().toLocaleDateString().replace('.','/').replace('.','/');
    $scope.SelectFile = function (file) {
        $scope.SelectedFile = file;
    };
    $scope.Upload = function () {
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
        if (regex.test($scope.SelectedFile.name.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                //For Browsers other than IE.
                if (reader.readAsBinaryString) {
                    reader.onload = function (e) {
                        $scope.ProcessExcel(e.target.result);
                    };
                    reader.readAsBinaryString($scope.SelectedFile);
                } else {
                    //For IE Browser.
                    reader.onload = function (e) {
                        var data = "";
                        var bytes = new Uint8Array(e.target.result);
                        for (var i = 0; i < bytes.byteLength; i++) {
                            data += String.fromCharCode(bytes[i]);
                        }
                        $scope.ProcessExcel(data);
                    };
                    reader.readAsArrayBuffer($scope.SelectedFile);
                }
            } else {
                $window.alert("This browser does not support HTML5.");
            }
        } else {
            $window.alert("Please upload a valid Excel file.");
        }
    };

    $scope.ProcessExcel = function (data) {
        //Read the Excel File data.
        var workbook = XLSX.read(data, {
            type: 'binary'
        });

        //Fetch the name of First Sheet.
        var firstSheet = workbook.SheetNames[0];

        //Read all rows from First Sheet into an JSON array.
        var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['TumListe']);

        //Display the data from Excel file in Table.
        $scope.$apply(function () {
            $scope.TumListe = excelRows;
            $scope.IsVisible = true;
        });
    };
    $scope.listele = function () {
        $scope.choosenList = [];
        $scope.result = [];
        $scope.record = {
            cariKod : null,
            eczaneAdi : null,
            tarih : null,
            iadeSatirSayisi : null,
            toplamTutar : null,
            toplamTutarStr : null,
            toplamTutarYazi : null,
            senetListesi : []
        };
        var selectedIndex = 0;
        for(var index = 0; index < $scope.TumListe.length; index++){
            if($scope.TumListe[index].selected){
                $scope.choosenList[selectedIndex] = $scope.TumListe[index];
                $scope.choosenList[selectedIndex].Vade = new Date($scope.choosenList[selectedIndex].Vade).toLocaleDateString().replace('.','/').replace('.','/');

                var hasResultCariKod = false;

                for(var resultIndex=0;resultIndex<$scope.result.length; resultIndex++){
                    if($scope.result[resultIndex] != null && $scope.result[resultIndex].cariKod == $scope.choosenList[selectedIndex].CariKodu){
                        $scope.result[resultIndex].senetListesi[$scope.result[resultIndex].senetListesi.length] = $scope.choosenList[selectedIndex];
                        $scope.result[resultIndex].iadeSatirSayisi = $scope.result[resultIndex].iadeSatirSayisi + 1;
                        $scope.result[resultIndex].toplamTutar = (parseFloat($scope.result[resultIndex].toplamTutar) + parseFloat($scope.choosenList[selectedIndex].Tutar.replace(",",""))).toFixed(2);
                        const constTutar = parseFloat($scope.result[resultIndex].toplamTutar).toFixed(2);

                        var tutar = new Intl.NumberFormat('tr-TR').format(constTutar);
                        //tutar = tutar.toLocaleString();
                        tutar = tutar.replace(',','-');
                        tutar = tutar.replace('.',',');
                        tutar = tutar.replace('-',',');
                        $scope.result[resultIndex].toplamTutarStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format($scope.result[resultIndex].toplamTutar);
                        $scope.result[resultIndex].toplamTutarStr = $scope.result[resultIndex].toplamTutarStr.replace('₺','');
                        $scope.result[resultIndex].toplamTutarStr = $scope.result[resultIndex].toplamTutarStr.replace(',','-');
                        $scope.result[resultIndex].toplamTutarStr = $scope.result[resultIndex].toplamTutarStr.replace('.',',');
                        $scope.result[resultIndex].toplamTutarStr = $scope.result[resultIndex].toplamTutarStr.replace('-','.');
                        $scope.result[resultIndex].toplamTutarYazi =  $scope.getTextAmount($scope.result[resultIndex].toplamTutar);
                        hasResultCariKod = true;
                        break;
                    }
                }
                if(!hasResultCariKod){
                    $scope.record = {
                        cariKod : $scope.choosenList[selectedIndex].CariKodu,
                        eczaneAdi : $scope.choosenList[selectedIndex].CiroEden,
                        tarih : $scope.date,
                        iadeSatirSayisi : 1,
                        toplamTutar : parseFloat($scope.choosenList[selectedIndex].Tutar.replace(",","")).toFixed(2),
                        toplamTutarStr : '',
                        toplamTutarYazi : $scope.getTextAmount($scope.choosenList[selectedIndex].Tutar),
                        senetListesi : []
                    };
                    const constTutar = parseFloat($scope.record.toplamTutar).toFixed(2);
                    $scope.record.toplamTutarStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format($scope.record.toplamTutar);
                    $scope.record.toplamTutarStr = $scope.record.toplamTutarStr.replace('₺','');
                    $scope.record.toplamTutarStr = $scope.record.toplamTutarStr.replace(',','-');
                    $scope.record.toplamTutarStr = $scope.record.toplamTutarStr.replace('.',',');
                    $scope.record.toplamTutarStr = $scope.record.toplamTutarStr.replace('-','.');
                    $scope.record.senetListesi[0] = $scope.choosenList[selectedIndex];
                    $scope.result[$scope.result.length] = $scope.record;
                };

                selectedIndex++;
            }
        }
        if(selectedIndex == 0){
            $window.alert("Hiç bir kayıt seçmediniz. En az bir kayıt seçerek tekrar deneyiniz.");
        }else{
            for(selectedIndex; selectedIndex<25; selectedIndex++){
                $scope.choosenList[selectedIndex] = {
                    T : '',  
                    CiroEden  : '',
                    Vade  : '',
                    Tutar : '',
                    CekinBankasi  : '',
                    PortfoyNo : ''
                };
            }
            
            for(var resultIndex = 0 ; resultIndex<$scope.result.length; resultIndex++){
                var senetListeLength = $scope.result[resultIndex].senetListesi.length;
                for(var senetIndex = senetListeLength; senetIndex<25; senetIndex++){
                    $scope.result[resultIndex].senetListesi[senetIndex] = {
                        T : '',  
                        CiroEden  : '',
                        Vade  : '',
                        Tutar : '',
                        CekinBankasi  : '',
                        PortfoyNo : ''
                    };
                }
            }
        }
    };
    $scope.export = function(){
        html2canvas(document.getElementById('resultDiv'), {
            onrendered: function (canvas) {
                var data = canvas.toDataURL(document.getElementById('secilenListeDiv'));
                var docDefinition = {
                    pageSize: 'A4',

                    // by default we use portrait, you can change it to landscape if you wish
                    //pageOrientation: 'landscape',

                    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                    pageMargins: [ 10, 10, 10, 10 ],
                    content: [{
                        image: data,
                        width: 900,
                        height: 1350,
                    }
                    ]
                };
                pdfMake.createPdf(docDefinition).download("test.pdf");
            }
        });
    };  

    $scope.printDocument = function() {
        const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
        const imgWidth = 208;
        const position = 0;
      
        let page1 = document.querySelector('#secilenListeDiv');
        let page2 = document.querySelector('#cekSenetBilgileriDiv');
        const [imgPage1, imgPage2] =  Promise.all([html2canvas(page1), html2canvas(page2)]);
        // Process first image
        let imgHeight = imgPage1.height * imgWidth / imgPage1.width;
        let contentDataURL = imgPage1.toDataURL('image/png');
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.addPage();
        // Process second image
        imgHeight = imgPage2.height * imgWidth / imgPage2.width;
        contentDataURL = imgPage2.toDataURL('image/png');
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      
        pdf.save('dashboard.pdf'); // Generated PDF
      }
    $scope.pdfDowload=function(){
            var pdf = new jsPDF();
            var specialElementHandlers = {
              '#editor': function (element, renderer) {
                  return true;
              }
            };
            var $addr = $(this).closest('.resultDiv').find('.pageDiv');
            var $temp = $('.content-template');
            $temp.find('h3').text($addr.find('h3').text());
            let page = document.querySelector('.pageDiv')
            pdf.fromHTML($temp.html(), 15, 15, {
                  'width': 900,
                  'elementHandlers':page
                  }
            );
            pdf.save('sample-file.pdf');
    };

    $scope.getTextAmount=function(sayi){
        //var sayi= document.getElementById("sayi"); // input kutusunu 
 
        //sayı kutusunda tuşa basıldığında
        //sayi.onkeyup=function(){
        //var goster=document.getElementById("goster");//div etiketi
        
        //var islem=new SayiDonustur(this.value);
        //return islem.sonuc;
        //} 
        
        
        /*sayı gösterme işlemini yapacak sınıf*/ 
        //function SayiDonustur(sayi){
        
        sayi=String(sayi);
        this.sonuc;
        
        let bolum1 = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
        let bolum2 = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];
        let bolum3 = ["", "Yüz", "Bin", "Milyon", "Milyar", "Trilyon", "Katrilyon"];
        
        let sayi1; //tam kısım
        let sayi2 = ""; // ondalıklı kısım
        let sonuc = "";
        
        sayi = sayi.replace(",","");
        //sayi = sayi.replace(",", "."); //virgül girilirse noktaya dönüştürülüyor
        
        if (sayi.indexOf(".") > 0) 
        { // nokta varsa (kuruş)
        
            sayi1 = sayi.substring(0, sayi.indexOf(".")); // tam kısım
            sayi2 = sayi.substring(sayi.indexOf("."), sayi.length); // ondalıklı kısım
        
        }
        else 
        {
            sayi1 = sayi; // ondalık yok
        }
        
        var rk = sayi1.split(""); // rakamlara ayırma
        
        let son;
        let w = 1; // işlenen basamak
        var sonaekle = 0; // binler on binler yüzbinler vs. için sona bin (milyon,trilyon...) eklenecek mi?
        let kac = rk.length; // kaç rakam var?
        let sonint; // işlenen basamağın rakamsal değeri
        let uclubasamak = 0; // hangi basamakta (birler onlar yüzler gibi)
        let artan = 0;  // binler milyonlar milyarlar gibi artışları yapar
        let gecici;
        
        if (kac > 0) { // virgül öncesinde rakam var mı?
        
            for (i = 0; i < kac; i++) 
            {
                son = rk[kac - 1 - i]; // son karakterden başlayarak çözümleme yapılır.
                sonint = parseInt(son); // işlenen rakam
                if (w == 1) 
                { // birinci basamak bulunuyor
                    sonuc = bolum1[sonint] + ' ' + sonuc;
                } 
                else if (w == 2) 
                { // ikinci basamak
                    sonuc = bolum2[sonint]+ ' ' + sonuc;
                } 
                else if (w == 3) 
                { // 3. basamak
                    if (sonint == 1) 
                    {
                        sonuc = bolum3[1]+ ' ' + sonuc;
                    } 
                    else if (sonint > 1) 
                    {
                        sonuc = bolum1[sonint] + ' ' + bolum3[1] + ' ' + sonuc;
                    }
                    uclubasamak++;
                }
                if (w > 3) 
                {    // 3. basamaktan sonraki işlemler
                    if (uclubasamak == 1) 
                    {
                        if (sonint > 0) 
                        {
                            sonuc = bolum1[sonint] + ' ' + bolum3[2 + artan] + ' '+ sonuc;
                            if (artan == 0) 
                            { // birbin yazmasını engelle
                                if(kac-1==i)
                                { //
                                    sonuc = sonuc.replace(bolum1[1] + ' ' + bolum3[2], ' ' + bolum3[2]);
                                }
                            }
                            sonaekle = 1; // sona bin eklendi
                        } 
                        else 
                        {
                            sonaekle = 0;
                        }
                        uclubasamak++;
                    

                    } 
                    else if (uclubasamak == 2) 
                    {
                        if (sonint > 0) 
                        {
                            if (sonaekle > 0) 
                            {
                                sonuc = bolum2[sonint]+ ' ' + sonuc;
                                sonaekle++;
                            } 
                            else
                            {
                                sonuc = bolum2[sonint]+ ' ' + bolum3[2 + artan] + ' ' + sonuc;
                                sonaekle++;
                            }
                        }
                        uclubasamak++;
                    
                    } 
                    else if (uclubasamak == 3) 
                    {
                        if (sonint > 0) 
                        {
                            if (sonint == 1) 
                            {
                                gecici = bolum3[1];
                            }
                            else 
                            {
                                gecici = bolum1[sonint] + ' ' + bolum3[1];
                            }
                            if (sonaekle == 0) 
                            {
                                gecici = gecici + ' ' + bolum3[2 + artan];
                            }
                            sonuc = gecici + ' ' + sonuc;
                        }
                        uclubasamak = 1;
                        artan++;
                    }
                
                }
                w++; // işlenen basamak
            }
        
        }
        
        return '#' + sonuc + 'TL.#';
    }
   
});