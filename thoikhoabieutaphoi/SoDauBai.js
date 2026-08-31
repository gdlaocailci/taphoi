// =========================================================================
// HÀM FETCH DỮ LIỆU TỪ MÁY CHỦ KHI KÍCH HOẠT TAB (TÍCH HỢP CHỐNG LỖI)
// =========================================================================
let daTaiDuLieuSoDauBai = false;

async function taiDuLieuSoDauBaiTuMayChu() {
    if (daTaiDuLieuSoDauBai) return;
    
    const vungHienThi = document.getElementById('vungHienThiSoDauBai');
    if (vungHienThi) {
        vungHienThi.innerHTML = `<div class="text-center py-10 text-slate-500 font-bold">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            Đang trích xuất Lịch sử TKB và Khung PPCT toàn trường...
        </div>`;
    }

    try {
        const phanHoi = await fetchVoiCoCheThuLai(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDuLieuSoDauBai`);
        const phanHoiText = await phanHoi.text();
        let duLieuSever;
        
        try {
            duLieuSever = JSON.parse(phanHoiText);
        } catch (loiParse) {
            throw new Error("Phản hồi từ Google Apps Script bị hỏng hoặc chưa Deploy phiên bản mới.");
        }

        if (duLieuSever.trangThai === 'loi_he_thong') {
            throw new Error(duLieuSever.thongBao);
        }
        
        // Gọi hàm lõi để xử lý (Hàm này nằm ngay bên dưới)
        khoiTaoDuLieuSoDauBai(duLieuSever);
        daTaiDuLieuSoDauBai = true;
    } catch (loi) {
        console.error("Lỗi tải Sổ đầu bài:", loi);
        if (vungHienThi) {
            vungHienThi.innerHTML = `<div class="text-center py-10 text-red-600 font-bold text-lg">
                ⚠️ Cảnh báo lỗi kết nối: <br><span class="text-base font-normal text-slate-700">${loi.message}</span>
            </div>`;
        }
    }
}

// =========================================================================
// KHỐI 1: KHỞI TẠO VÀ ÁNH XẠ DỮ LIỆU TỐC ĐỘ CAO (THUẬT TOÁN CON TRỞ TIẾN ĐỘ)
// =========================================================================
let duLieuTKBGopDaMap = [];

function khoiTaoDuLieuSoDauBai(duLieuSever) {
    let tkbLichSu = duLieuSever.DATA_TKB || [];
    let tkbHienTai = duLieuSever.TKB_HIEN_TAI || [];
    let tkbGop = [...tkbLichSu, ...tkbHienTai];

    // 1. Sắp xếp TKB tuần tự tuyệt đối theo thời gian
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

    // 2. Nạp khung PPCT gốc theo KHỐI
    let khungPPCT = {}; 
    if (duLieuSever.PPCT) {
        duLieuSever.PPCT.forEach(dong => {
            let khoi = String(dong['Khối lớp'] || '').trim();
            let mon = String(dong['Tên môn học'] || '').trim().toLowerCase();
            let khoa = `${khoi}_${mon}`;
            
            if (!khungPPCT[khoa]) khungPPCT[khoa] = [];
            khungPPCT[khoa].push({
                tietPPCT: dong['Tiết PPCT'] || '',
                tenBai: dong['Tên bài học'] || ''
            });
        });
    }

    // 3. Quét TKB, ráp PPCT sử dụng Con trỏ độc lập cho từng LỚP + MÔN
    let conTroPPCT = {}; 
    
    duLieuTKBGopDaMap = tkbGop.map(dong => {
        let maLop = String(dong['Mã Lớp'] || '').trim().toUpperCase();
        let mon = String(dong['Môn Học'] || '').trim().toLowerCase();
        let khoi = maLop.replace(/[^0-9]/g, ''); 
        
        let khoaKhung = `${khoi}_${mon}`;
        let khoaLop = `${maLop}_${mon}`; 
        
        if (conTroPPCT[khoaLop] === undefined) {
            conTroPPCT[khoaLop] = 0; 
        }
        
        let tietPPCT = '';
        let tenBai = '';
        
        if (khungPPCT[khoaKhung] && conTroPPCT[khoaLop] < khungPPCT[khoaKhung].length) {
            let indexHienTai = conTroPPCT[khoaLop];
            let duLieuTiet = khungPPCT[khoaKhung][indexHienTai];
            tietPPCT = duLieuTiet.tietPPCT;
            tenBai = duLieuTiet.tenBai;
            
            conTroPPCT[khoaLop]++; 
        }
        
        return {
            ...dong,
            TietPPCT: tietPPCT,
            TenBai: tenBai
        };
    });

    napDropdownSoDauBai();
}

function napDropdownSoDauBai() {
    let tapHopTuan = new Set();
    let tapHopLop = new Set();

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
// KHỐI 2: XỬ LÝ LỌC VÀ VẼ GIAO DIỆN HTML THEO MẪU SỔ
// =========================================================================
function ketXuatSoDauBaiLenLuoi() {
    let tuanChon = document.getElementById('chonTuanSo')?.value;
    let lopChon = document.getElementById('chonLopSo')?.value;
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');

    if (!tuanChon || !lopChon || !vungHienThi) return;

    let tkbLop = duLieuTKBGopDaMap.filter(d => String(d['Tuần']).trim() === tuanChon && String(d['Mã Lớp']).trim() === lopChon);

    let duLieuSang = tkbLop.filter(d => String(d['Buổi']).trim().toLowerCase() === 'sáng');
    let duLieuChieu = tkbLop.filter(d => String(d['Buổi']).trim().toLowerCase() === 'chiều');

    let ngayBatDau = tkbLop.length > 0 ? tkbLop[0]['Ngày'] : '...';

    const taoBangHtml = (duLieu, tenBuoi) => {
        if (duLieu.length === 0) return '';
        
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
                            <th class="border border-gray-500 p-2 w-28">MÔN</th>
                            <th class="border border-gray-500 p-2 w-16">TIẾT PPCT</th>
                            <th class="border border-gray-500 p-2">TÊN BÀI DẠY</th>
                            <th class="border border-gray-500 p-2 w-24">CHỮ KÝ CỦA GV</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let thuHienTai = '';
        let rowSpanCount = 0;
        
        duLieu.forEach(dong => {
            if (dong['Thứ'] !== thuHienTai) {
                rowSpanCount = duLieu.filter(d => d['Thứ'] === dong['Thứ']).length;
                html += `<tr><td class="border border-gray-500 text-center font-bold uppercase" rowspan="${rowSpanCount}">${dong['Thứ']}</td>`;
                thuHienTai = dong['Thứ'];
            } else {
                html += `<tr>`;
            }

            html += `
                    <td class="border border-gray-500 text-center p-1.5">${dong['Tiết']}</td>
                    <td class="border border-gray-500 text-center p-1.5"></td>
                    <td class="border border-gray-500 p-1.5 font-semibold text-center">${dong['Môn Học']}</td>
                    <td class="border border-gray-500 text-center p-1.5 font-bold text-blue-800">${dong['TietPPCT']}</td>
                    <td class="border border-gray-500 p-1.5">${dong['TenBai']}</td>
                    <td class="border border-gray-500 p-1.5"></td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        return html;
    };

    vungHienThi.innerHTML = taoBangHtml(duLieuSang, "SÁNG") + taoBangHtml(duLieuChieu, "CHIỀU");
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
