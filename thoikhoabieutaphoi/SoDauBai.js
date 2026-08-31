// =========================================================================
// HÀM FETCH DỮ LIỆU TỪ MÁY CHỦ KHI KÍCH HOẠT TAB
// =========================================================================
let daTaiDuLieuSoDauBai = false;

async function taiDuLieuSoDauBaiTuMayChu() {
    if (daTaiDuLieuSoDauBai) return;
    
    const vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (vungHienThi) {
        vungHienThi.innerHTML = `<div class="text-center py-10 text-slate-500 font-bold">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            Đang trích xuất Lịch sử TKB và tính toán Khung PPCT toàn trường...
        </div>`;
    }

    try {
        const phanHoi = await fetchVoiCoCheThuLai(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDuLieuSoDauBai`);
        const phanHoiText = await phanHoi.text();
        let duLieuSever;
        
        try { duLieuSever = JSON.parse(phanHoiText); } 
        catch (loiParse) { throw new Error("Phản hồi từ máy chủ bị hỏng. Vui lòng Deploy lại mã Code.gs."); }

        if (duLieuSever.trangThai === 'loi_he_thong') throw new Error(duLieuSever.thongBao);
        
        khoiTaoDuLieuSoDauBai(duLieuSever);
        daTaiDuLieuSoDauBai = true;
    } catch (loi) {
        console.error("Lỗi tải Sổ đầu bài:", loi);
        if (vungHienThi) {
            vungHienThi.innerHTML = `<div class="text-center py-10 text-red-600 font-bold text-lg">⚠️ Cảnh báo lỗi kết nối: <br><span class="text-base font-normal text-slate-700">${loi.message}</span></div>`;
        }
    }
}

// =========================================================================
// KHỐI 1: ÁNH XẠ DỮ LIỆU TỰ ĐỘNG BẰNG TỊNH TIẾN TỪ TUẦN 1
// =========================================================================
let duLieuTKBGopDaMap = [];
let tuDienPPCTToanCuc = {}; 

function khoiTaoDuLieuSoDauBai(duLieuSever) {
    let tkbLichSu = duLieuSever.DATA_TKB || [];
    let tkbHienTai = duLieuSever.TKB_HIEN_TAI || [];
    let tkbGop = [...tkbLichSu, ...tkbHienTai];

    const thuTuThu = { "Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8 };
    const thuTuBuoi = { "sáng": 1, "chiều": 2, "tối": 3 };
    
    tkbGop.sort((a, b) => {
        let tuanA = parseInt(a['Tuần']) || 0; let tuanB = parseInt(b['Tuần']) || 0;
        if (tuanA !== tuanB) return tuanA - tuanB;
        let thuA = thuTuThu[String(a['Thứ']).trim()] || 99; let thuB = thuTuThu[String(b['Thứ']).trim()] || 99;
        if (thuA !== thuB) return thuA - thuB;
        let buoiA = thuTuBuoi[String(a['Buổi']).trim().toLowerCase()] || 99; let buoiB = thuTuBuoi[String(b['Buổi']).trim().toLowerCase()] || 99;
        if (buoiA !== buoiB) return buoiA - buoiB;
        return (parseInt(a['Tiết']) || 0) - (parseInt(b['Tiết']) || 0);
    });

    tuDienPPCTToanCuc = {}; 
    if (duLieuSever.PPCT) {
        duLieuSever.PPCT.forEach(dong => {
            let khoi = String(dong['Khối lớp'] || dong['Khối'] || '').trim();
            let mon = String(dong['Tên môn học'] || dong['Môn học'] || dong['Môn Học'] || '').trim().toLowerCase();
            let tietPPCT_Goc = String(dong['Tiết PPCT'] || dong['Tiết'] || '').trim();
            
            let khoa = `${khoi}_${mon}_${tietPPCT_Goc}`;
            tuDienPPCTToanCuc[khoa] = dong['Tên bài học'] || dong['Tên bài'] || dong['Tên bài dạy'] || dong['Nội dung'] || '';
        });
    }

    let boDemTietCuaLop = {}; 
    
    duLieuTKBGopDaMap = tkbGop.map(dong => {
        let maLop = String(dong['Mã Lớp'] || '').trim().toUpperCase();
        let mon = String(dong['Môn Học'] || '').trim();
        
        // [ĐÃ SỬA LỖI TÁCH KHỐI]: Bốc chính xác nhóm số đầu tiên (Lớp 1A1 -> Khối 1)
        let matchKhoi = maLop.match(/\d+/);
        let khoi = matchKhoi ? matchKhoi[0] : ''; 
        
        let tietThucTe = ''; let tenBaiHoc = '';
        
        if (mon && mon !== '') {
            let khoaDem = `${maLop}_${mon.toLowerCase()}`;
            if (!boDemTietCuaLop[khoaDem]) boDemTietCuaLop[khoaDem] = 0;
            boDemTietCuaLop[khoaDem]++; 
            tietThucTe = boDemTietCuaLop[khoaDem];
            
            let khoaTraPPCT = `${khoi}_${mon.toLowerCase()}_${tietThucTe}`;
            tenBaiHoc = tuDienPPCTToanCuc[khoaTraPPCT] || ''; 
            
            if (tenBaiHoc === '') {
                let monKhongSo = mon.toLowerCase().replace(/[0-9]/g, '').trim();
                let khoaPhu = `${khoi}_${monKhongSo}_${tietThucTe}`;
                tenBaiHoc = tuDienPPCTToanCuc[khoaPhu] || '';
            }
        }
        
        return { ...dong, TietPPCT_Thuc: tietThucTe, TenBai_Thuc: tenBaiHoc };
    });

    napDropdownSoDauBai();
}

function napDropdownSoDauBai() {
    let tapHopTuan = new Set(); let tapHopLop = new Set();
    duLieuTKBGopDaMap.forEach(dong => {
        if (dong['Tuần']) tapHopTuan.add(String(dong['Tuần']).trim());
        if (dong['Mã Lớp']) tapHopLop.add(String(dong['Mã Lớp']).trim());
    });

    let mangTuan = Array.from(tapHopTuan).sort((a, b) => parseInt(a) - parseInt(b));
    let mangLop = Array.from(tapHopLop).sort();

    let chonTuanHtml = mangTuan.map(t => `<option value="${t}">Tuần ${t}</option>`).join('');
    let chonLopHtml = mangLop.map(l => `<option value="${l}">Lớp ${l}</option>`).join('');

    let elementTuan = document.getElementById('chonTuanSo');
    let elementLop = document.getElementById('chonLopSo');
    
    if(elementTuan) elementTuan.innerHTML = chonTuanHtml;
    if(elementLop) elementLop.innerHTML = chonLopHtml;

    setTimeout(ketXuatSoDauBaiLenLuoi, 50);
}

// =========================================================================
// KHỐI 2: VẼ GIAO DIỆN & HÀM ĐỒNG BỘ THỦ CÔNG
// =========================================================================
function ketXuatSoDauBaiLenLuoi() {
    let tuanChon = document.getElementById('chonTuanSo')?.value;
    let lopChon = document.getElementById('chonLopSo')?.value;
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');

    if (!tuanChon || !lopChon || !vungHienThi) return;

    let tkbTuanNay = duLieuTKBGopDaMap.filter(d => String(d['Tuần']).trim() === tuanChon && String(d['Mã Lớp']).trim() === lopChon);

    let dictTKB = {}; let ngayBatDau = '...';
    tkbTuanNay.forEach(dong => {
        if (ngayBatDau === '...') ngayBatDau = dong['Ngày'] || '...';
        let buoiKiemTra = String(dong['Buổi']).trim().toLowerCase() === 'sáng' ? 'Sang' : 'Chieu';
        let khoa = `${String(dong['Thứ']).trim()}_${buoiKiemTra}_${dong['Tiết']}`;
        dictTKB[khoa] = dong;
    });

    const danhSachThu = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

    const taoBangHtml = (tenBuoi, soTietToiDa) => {
        let buoiKey = tenBuoi === "SÁNG" ? "Sang" : "Chieu";
        
        let html = `
            <div class="mb-8 bang-so-dau-bai-container">
                <div class="flex justify-between items-center mb-2 font-bold text-slate-800 uppercase">
                    <span>LỚP: ${lopChon}</span>
                    <span>TUẦN ${tuanChon}: BUỔI ${tenBuoi}</span>
                </div>
                <div class="text-center italic mb-2 text-sm text-slate-600">
                    (Từ ngày ${ngayBatDau} đến ngày ... tháng ... năm ...)
                </div>
                <table class="w-full border-collapse border border-gray-500 text-sm">
                    <thead class="bg-slate-100 text-center font-bold">
                        <tr>
                            <th class="border border-gray-500 p-2 w-16">THỨ</th>
                            <th class="border border-gray-500 p-2 w-12">TIẾT</th>
                            <th class="border border-gray-500 p-2 w-16">C.CẦN</th>
                            <th class="border border-gray-500 p-2 w-32">MÔN</th>
                            <th class="border border-gray-500 p-2 w-16">TIẾT PPCT</th>
                            <th class="border border-gray-500 p-2">TÊN BÀI DẠY</th>
                            <th class="border border-gray-500 p-2 w-24">CHỮ KÝ CỦA GV</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        danhSachThu.forEach(thu => {
            for (let tiet = 1; tiet <= soTietToiDa; tiet++) {
                let khoaKiemTra = `${thu}_${buoiKey}_${tiet}`;
                let dongDuLieu = dictTKB[khoaKiemTra]; 

                let monHoc = dongDuLieu ? dongDuLieu['Môn Học'] : '';
                let tietPPCT = dongDuLieu ? dongDuLieu['TietPPCT_Thuc'] : '';
                let tenBai = dongDuLieu ? dongDuLieu['TenBai_Thuc'] : '';

                html += `<tr class="hover:bg-slate-50">`;
                
                if (tiet === 1) {
                    html += `<td class="border border-gray-500 text-center font-bold uppercase" rowspan="${soTietToiDa}">${thu}</td>`;
                }

                html += `
                    <td class="border border-gray-500 text-center p-1.5">${tiet}</td>
                    <td class="border border-gray-500 text-center p-1.5"></td>
                    <td class="border border-gray-500 p-1.5 font-semibold text-center text-slate-800" data-loai="mon">${monHoc}</td>
                    <td class="border border-gray-500 text-center p-1.5 font-bold text-blue-800" data-loai="tiet">${tietPPCT}</td>
                    <td class="border border-gray-500 p-1.5 text-slate-700 font-semibold" data-loai="tenBai">${tenBai}</td>
                    <td class="border border-gray-500 p-1.5"></td>
                </tr>`;
            }
        });

        html += `</tbody></table></div>`;
        return html;
    };

    vungHienThi.innerHTML = taoBangHtml("SÁNG", 5) + taoBangHtml("CHIỀU", 4);
    setTimeout(dongBoTenBaiHoc, 100);
}

function dongBoTenBaiHoc() {
    const btn = document.getElementById('btnDongBoTenBai');
    let textGoc = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;
        btn.disabled = true;
    }

    setTimeout(() => {
        let lopChon = document.getElementById('chonLopSo')?.value;
        if (!lopChon) {
            if (btn) { btn.innerHTML = textGoc; btn.disabled = false; }
            return;
        }
        
        // [ĐÃ SỬA LỖI TÁCH KHỐI]
        let matchKhoi = lopChon.match(/\d+/);
        let khoi = matchKhoi ? matchKhoi[0] : '';
        
        let cacDong = document.querySelectorAll('#vungHienThiSoDauBai tbody tr');
        
        cacDong.forEach(dong => {
            let oMon = dong.querySelector('td[data-loai="mon"]');
            let oTiet = dong.querySelector('td[data-loai="tiet"]');
            let oTenBai = dong.querySelector('td[data-loai="tenBai"]');
            
            if (oMon && oTiet && oTenBai) {
                let mon = oMon.innerText.trim().toLowerCase();
                let tiet = oTiet.innerText.trim();
                
                if (mon !== '' && tiet !== '') {
                    let khoaChinh = `${khoi}_${mon}_${tiet}`;
                    let baiDay = tuDienPPCTToanCuc[khoaChinh] || '';
                    
                    if (baiDay === '') {
                        let monRutGon = mon.replace(/[0-9]/g, '').trim();
                        let khoaPhu = `${khoi}_${monRutGon}_${tiet}`;
                        baiDay = tuDienPPCTToanCuc[khoaPhu] || '';
                    }

                    if (baiDay !== '') {
                        oTenBai.innerText = baiDay;
                    }
                }
            }
        });
        
        if (btn) { btn.innerHTML = textGoc; btn.disabled = false; }
    }, 100); 
}

// =========================================================================
// KHỐI 3: KẾT XUẤT VĂN BẢN (WORD VÀ EXCEL)
// =========================================================================
function xuatWordSoDauBai() {
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (!vungHienThi || vungHienThi.innerText.includes('Vui lòng chọn')) return alert("Không có dữ liệu để xuất!");

    let tuanChon = document.getElementById('chonTuanSo').value;
    let lopChon = document.getElementById('chonLopSo').value;

    let preHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Sổ Đầu Bài</title>
        <style>
            @page WordSection1 { size: 841.9pt 595.3pt; mso-page-orientation: landscape; margin: 1.0in 1.0in 1.0in 1.0in; }
            div.WordSection1 { page: WordSection1; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-family: "Times New Roman", Times, serif; font-size: 13pt; }
            th, td { border: 1px solid black; padding: 5px; }
            th { text-align: center; font-weight: bold; }
            .text-center { text-align: center; }
            .italic { font-style: italic; }
            .flex { display: table; width: 100%; font-weight: bold; margin-bottom: 5px; }
            .justify-between span { display: table-cell; width: 50%; }
            .justify-between span:last-child { text-align: right; }
        </style>
        </head><body><div class='WordSection1'>
    `;
    
    let htmlContent = preHtml + vungHienThi.innerHTML + "</div></body></html>";
    let blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SoDauBai_Lop${lopChon}_Tuan${tuanChon}.doc`;
    link.click();
}

async function xuatExcelSoDauBai() {
    try {
        if (typeof ExcelJS === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('SO_DAU_BAI');
        
        let tuanChon = document.getElementById('chonTuanSo').value;
        let lopChon = document.getElementById('chonLopSo').value;
        const cacBang = document.querySelectorAll('#vungHienThiSoDauBai .bang-so-dau-bai-container');
        
        if(cacBang.length === 0) return alert("Không có dữ liệu để xuất!");
        let rowIndex = 1;

        cacBang.forEach(khungBang => {
            let rowHeader1 = worksheet.getRow(rowIndex);
            rowHeader1.getCell(1).value = khungBang.querySelector('.flex').innerText.replace(/\n/g, '                ');
            rowHeader1.font = { name: 'Times New Roman', size: 14, bold: true };
            worksheet.mergeCells(`A${rowIndex}:G${rowIndex}`);
            rowIndex++;

            let rowHeader2 = worksheet.getRow(rowIndex);
            rowHeader2.getCell(1).value = khungBang.querySelector('.italic').innerText;
            rowHeader2.font = { name: 'Times New Roman', size: 12, italic: true };
            rowHeader2.getCell(1).alignment = { horizontal: 'center' };
            worksheet.mergeCells(`A${rowIndex}:G${rowIndex}`);
            rowIndex++;

            const rows = khungBang.querySelectorAll('table tr');
            rows.forEach((tr, idx) => {
                let rData = [];
                tr.querySelectorAll('th, td').forEach(cell => rData.push(cell.innerText));

                if(idx > 0 && rData.length < 7) rData.unshift(''); 

                let row = worksheet.addRow(rData);
                row.font = { name: 'Times New Roman', size: 12 };
                
                if (idx === 0) {
                    row.font = { bold: true, name: 'Times New Roman' };
                    row.alignment = { vertical: 'middle', horizontal: 'center' };
                }

                row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                    if([1, 2, 5].includes(colNumber)) cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });
                rowIndex++;
            });

            rowIndex += 2;
        });

        worksheet.eachRow((row, rowNumber) => {
            let val = row.getCell(1).value;
            if (val && typeof val === 'string' && val.startsWith('THỨ ') && val !== 'THỨ') {
                let rowsToMerge = 0;
                while(worksheet.getCell(rowNumber + rowsToMerge + 1, 1).value === '') {
                    if(worksheet.getCell(rowNumber + rowsToMerge + 1, 2).value === null) break;
                    rowsToMerge++;
                }
                if (rowsToMerge > 0) worksheet.mergeCells(`A${rowNumber}:A${rowNumber + rowsToMerge}`);
                row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            }
        });

        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 8;
        worksheet.getColumn(3).width = 10;
        worksheet.getColumn(4).width = 25;
        worksheet.getColumn(5).width = 12;
        worksheet.getColumn(6).width = 50;
        worksheet.getColumn(7).width = 20;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `SoDauBai_Lop${lopChon}_Tuan${tuanChon}.xlsx`;
        link.click();

    } catch (loi) {
        console.error(loi);
        alert("Có lỗi khi tạo tệp Excel!");
    }
}
