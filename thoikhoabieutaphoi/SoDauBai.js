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
            Đang trích xuất Lịch sử Chốt sổ và Khung PPCT toàn trường...
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
// KHỐI 1: MA TRẬN TỊNH TIẾN DỰA TRÊN LỊCH SỬ CHỐT SỔ (SOURCE OF TRUTH)
// =========================================================================
let duLieuTKBGopDaMap = [];
let tuDienPPCTToanCuc = {}; 
let dinhMucKhungCT = {}; 

function khoiTaoDuLieuSoDauBai(duLieuSever) {
    let tkbLichSu = duLieuSever.DATA_TKB || [];
    let tkbHienTai = duLieuSever.TKB_HIEN_TAI || [];
    let tkbGop = [...tkbLichSu, ...tkbHienTai];

    const thuTuThu = { "Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8 };
    const thuTuBuoi = { "sáng": 1, "chiều": 2, "tối": 3 };
    
    // Sắp xếp trục thời gian tuyệt đối
    tkbGop.sort((a, b) => {
        let tuanA = parseInt(String(a['Tuần']).replace(/\D/g, '')) || 0; 
        let tuanB = parseInt(String(b['Tuần']).replace(/\D/g, '')) || 0;
        if (tuanA !== tuanB) return tuanA - tuanB;
        let thuA = thuTuThu[String(a['Thứ']).trim()] || 99; let thuB = thuTuThu[String(b['Thứ']).trim()] || 99;
        if (thuA !== thuB) return thuA - thuB;
        let buoiA = thuTuBuoi[String(a['Buổi']).trim().toLowerCase()] || 99; let buoiB = thuTuBuoi[String(b['Buổi']).trim().toLowerCase()] || 99;
        if (buoiA !== buoiB) return buoiA - buoiB;
        return (parseInt(a['Tiết']) || 0) - (parseInt(b['Tiết']) || 0);
    });

    // Phân tích Khung Chương Trình (Radar)
    dinhMucKhungCT = {};
    if (duLieuSever.KHUNG_CHUONG_TRINH) {
        duLieuSever.KHUNG_CHUONG_TRINH.forEach(dong => {
            let mon = String(dong['Môn học'] || dong['Tên môn học'] || dong['Môn Học'] || '').trim().toLowerCase();
            if (!mon) return;
            Object.keys(dong).forEach(key => {
                let matchKhoi = key.match(/\d+/);
                if (matchKhoi && key !== 'Môn học' && key !== 'Ưu tiên' && key !== 'Tên môn học') {
                    let khoi = matchKhoi[0];
                    if (!dinhMucKhungCT[khoi]) dinhMucKhungCT[khoi] = {};
                    let tiet = parseInt(dong[key]) || 0;
                    if (tiet > 0) dinhMucKhungCT[khoi][mon] = tiet;
                }
            });
        });
    }

    // Nạp Từ điển PPCT
    tuDienPPCTToanCuc = {}; 
    if (duLieuSever.PPCT) {
        let boNhoKhoi = ''; 
        duLieuSever.PPCT.forEach(dong => {
            let khoiGoc = String(dong['Khối lớp'] || dong['Khối'] || '').trim();
            if (khoiGoc !== '') boNhoKhoi = khoiGoc; else khoiGoc = boNhoKhoi; 
            
            let matchKhoi = khoiGoc.match(/\d+/);
            let khoi = matchKhoi ? matchKhoi[0] : khoiGoc; 
            let mon = String(dong['Tên môn học'] || dong['Môn học'] || dong['Môn Học'] || '').trim().toLowerCase();
            let tietPPCT_Goc = String(dong['Tiết PPCT'] || dong['Tiết'] || '').trim();
            
            let khoa = `${khoi}_${mon}_${tietPPCT_Goc}`;
            tuDienPPCTToanCuc[khoa] = dong['Tên bài học'] || dong['Tên bài'] || dong['Tên bài dạy'] || dong['Nội dung'] || '';
        });
    }

    // Bản đồ Dữ Liệu Đã Chốt Sổ
    let soDauBaiDaLuu = {};
    if (duLieuSever.SO_DAU_BAI) {
        duLieuSever.SO_DAU_BAI.forEach(dong => {
            let tuan = String(dong['Tuần']).trim();
            let lop = String(dong['Mã Lớp']).trim().toUpperCase();
            let thu = String(dong['Thứ']).trim();
            let buoi = String(dong['Buổi']).trim().toLowerCase() === 'sáng' ? 'Sáng' : 'Chiều';
            let tiet = String(dong['Tiết']).trim();
            
            let khoa = `${tuan}_${lop}_${thu}_${buoi}_${tiet}`;
            soDauBaiDaLuu[khoa] = {
                TietPPCT: dong['Tiết PPCT'] || '',
                TenBai: dong['Tên Bài Dạy'] || dong['Tên bài dạy'] || dong['Tên Bài'] || dong['Tên bài'] || ''
            };
        });
    }

    // THUẬT TOÁN ĐẾM TỊNH TIẾN 
    let boDemTietCuaLop = {}; 
    
    duLieuTKBGopDaMap = tkbGop.map(dong => {
        let tuan = String(dong['Tuần']).trim();
        let maLop = String(dong['Mã Lớp'] || '').trim().toUpperCase();
        let thu = String(dong['Thứ']).trim();
        let buoi = String(dong['Buổi']).trim().toLowerCase() === 'sáng' ? 'Sáng' : 'Chiều';
        let tiet = String(dong['Tiết']).trim();
        let mon = String(dong['Môn Học'] || '').trim();
        
        let khoaTKB = `${tuan}_${maLop}_${thu}_${buoi}_${tiet}`;
        let dongDaLuu = soDauBaiDaLuu[khoaTKB]; 
        
        let tietThucTe = ''; 
        let tenBaiHoc = '';
        let isDaLuu = false;

        if (mon && mon !== '') {
            let khoaDem = `${maLop}_${mon.toLowerCase()}`;
            
            if (dongDaLuu) {
                isDaLuu = true;
                tietThucTe = dongDaLuu.TietPPCT;
                tenBaiHoc = dongDaLuu.TenBai;
                
                let tietNum = parseInt(String(tietThucTe).replace(/\D/g, '')) || 0;
                if (tietNum > (boDemTietCuaLop[khoaDem] || 0)) {
                    boDemTietCuaLop[khoaDem] = tietNum; 
                }
            } else {
                if (!boDemTietCuaLop[khoaDem]) boDemTietCuaLop[khoaDem] = 0;
                boDemTietCuaLop[khoaDem]++; 
                tietThucTe = boDemTietCuaLop[khoaDem];
                tenBaiHoc = ''; 
            }
        }
        
        return { ...dong, TietPPCT_Thuc: tietThucTe, TenBai_Thuc: tenBaiHoc, DaLuu: isDaLuu };
    });

    napDropdownSoDauBai();
}

function napDropdownSoDauBai() {
    let tapHopTuan = new Set(); let tapHopLop = new Set();
    duLieuTKBGopDaMap.forEach(dong => {
        if (dong['Tuần']) tapHopTuan.add(String(dong['Tuần']).trim());
        if (dong['Mã Lớp']) tapHopLop.add(String(dong['Mã Lớp']).trim());
    });

    let mangTuan = Array.from(tapHopTuan).sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,'')));
    let mangLop = Array.from(tapHopLop).sort();

    let chonTuanHtml = mangTuan.map(t => `<option value="${t}">Tuần ${t.replace(/\D/g,'')}</option>`).join('');
    let chonLopHtml = mangLop.map(l => `<option value="${l}">Lớp ${l}</option>`).join('');

    let elementTuan = document.getElementById('chonTuanSo');
    let elementLop = document.getElementById('chonLopSo');
    
    if(elementTuan) elementTuan.innerHTML = chonTuanHtml;
    if(elementLop) elementLop.innerHTML = chonLopHtml;

    setTimeout(ketXuatSoDauBaiLenLuoi, 50);
}

// =========================================================================
// KHỐI 2: VẼ GIAO DIỆN & THANH RADAR CẢNH BÁO TIẾN ĐỘ
// =========================================================================
function tinhNgayTuInputDate(ngayYMD, tenThu) {
    if (!ngayYMD) return '';
    let dateObj = new Date(ngayYMD);
    if (isNaN(dateObj.getTime())) return '';
    const doLech = { "Thứ 2": 0, "Thứ 3": 1, "Thứ 4": 2, "Thứ 5": 3, "Thứ 6": 4, "Thứ 7": 5, "Chủ nhật": 6 };
    dateObj.setDate(dateObj.getDate() + (doLech[tenThu] || 0));
    return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
}

function ketXuatSoDauBaiLenLuoi() {
    let tuanChon = document.getElementById('chonTuanSo')?.value;
    let lopChon = document.getElementById('chonLopSo')?.value;
    let inputNgay = document.getElementById('chonNgaySDB');
    let vungHienThi = document.getElementById('vungHienThiSoDauBai');

    if (!tuanChon || !lopChon || !vungHienThi) return;

    // --- BỘ MÁY TÍNH TOÁN CẢNH BÁO TIẾN ĐỘ ---
    let maxTuanChon = parseInt(tuanChon.replace(/\D/g, '')) || 0;
    let demTietThucTe = {}; 
    
    let tkbDenTuanNay = duLieuTKBGopDaMap.filter(d => {
        let t = parseInt(String(d['Tuần']).replace(/\D/g, '')) || 0;
        return t <= maxTuanChon && String(d['Mã Lớp']).trim() === lopChon;
    });

    tkbDenTuanNay.forEach(d => {
        let monGoc = String(d['Môn Học']).trim().toLowerCase();
        if (!monGoc) return;
        demTietThucTe[monGoc] = (demTietThucTe[monGoc] || 0) + 1;
        let monRutGon = monGoc.replace(/[0-9]/g, '').trim();
        if (monGoc !== monRutGon && monRutGon !== '') {
            demTietThucTe[monRutGon] = (demTietThucTe[monRutGon] || 0) + 1;
        }
    });

    let matchKhoiChon = lopChon.match(/\d+/);
    let khoiChon = matchKhoiChon ? matchKhoiChon[0] : '';
    let dinhMucKhoiNay = dinhMucKhungCT[khoiChon] || {};
    
    let canhBaoHtml = ''; let hasCanhBao = false;

    for (let mon in dinhMucKhoiNay) {
        let dinhMuc = dinhMucKhoiNay[mon];
        let tietThucTe = demTietThucTe[mon] || 0; 
        let tietChuanDuKien = dinhMuc * maxTuanChon;
        let doLech = tietThucTe - tietChuanDuKien;
        let tenMonIn = mon.charAt(0).toUpperCase() + mon.slice(1);

        if (doLech < 0) { 
            canhBaoHtml += `<span class="bg-red-100 text-red-700 font-bold px-3 py-1 rounded border border-red-200 shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>${tenMonIn}: Chậm ${Math.abs(doLech)}</span>`;
            hasCanhBao = true;
        } else if (doLech > 0) { 
            canhBaoHtml += `<span class="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded border border-orange-200 shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>${tenMonIn}: Vượt ${doLech}</span>`;
            hasCanhBao = true;
        }
    }

    let thanhCanhBaoRender = hasCanhBao ? `<div class="mb-4 p-3 bg-white border-l-4 border-red-500 shadow-sm text-sm flex flex-col md:flex-row md:items-center gap-3 w-full"><div class="flex items-center gap-2 flex-none"><div class="p-1.5 bg-red-100 rounded-full"><svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div><span class="font-extrabold text-red-700 uppercase tracking-wide">Cảnh báo Tiến độ:</span></div><div class="flex flex-wrap gap-2 flex-1">${canhBaoHtml}</div></div>` : '';

    // --- VẼ BẢNG SỔ ĐẦU BÀI ---
    let tkbTuanNay = duLieuTKBGopDaMap.filter(d => String(d['Tuần']).trim() === tuanChon && String(d['Mã Lớp']).trim() === lopChon);

    let dictTKB = {}; 
    let mapNgayChinhXac = {}; 
    let coDayBuThu7 = false; let coDayBuChuNhat = false;

    tkbTuanNay.forEach(dong => {
        let thuGoc = String(dong['Thứ']).trim();
        if (thuGoc === 'Thứ 7') coDayBuThu7 = true;
        if (thuGoc === 'Chủ nhật') coDayBuChuNhat = true;

        if (dong['Ngày'] && dong['Ngày'] !== '' && dong['Ngày'] !== '...') mapNgayChinhXac[thuGoc] = dong['Ngày']; 

        let buoiKiemTra = String(dong['Buổi']).trim().toLowerCase() === 'sáng' ? 'Sang' : 'Chieu';
        let khoa = `${thuGoc}_${buoiKiemTra}_${dong['Tiết']}`;
        dictTKB[khoa] = dong;
    });

    let danhSachThu = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    if (coDayBuThu7) danhSachThu.push("Thứ 7");
    if (coDayBuChuNhat) danhSachThu.push("Chủ nhật");

    let mienNgayHienTai = inputNgay ? inputNgay.value : '';
    if (!mienNgayHienTai && mapNgayChinhXac['Thứ 2']) {
        let p = mapNgayChinhXac['Thứ 2'].split('/');
        if (p.length === 3) {
            mienNgayHienTai = `${p[2]}-${p[1]}-${p[0]}`; 
            if (inputNgay) inputNgay.value = mienNgayHienTai;
        }
    }

    let ngayDauTieuDe = mapNgayChinhXac['Thứ 2'] || (mienNgayHienTai ? tinhNgayTuInputDate(mienNgayHienTai, "Thứ 2") : '...');
    let ngayCuoiTieuDe = mapNgayChinhXac[danhSachThu[danhSachThu.length - 1]] || (mienNgayHienTai ? tinhNgayTuInputDate(mienNgayHienTai, danhSachThu[danhSachThu.length - 1]) : '...');

    const taoBangHtml = (tenBuoi, soTietToiDa) => {
        let buoiKey = tenBuoi === "SÁNG" ? "Sang" : "Chieu";
        
        let html = `
            <div class="mb-8 bang-so-dau-bai-container">
                <div class="flex justify-between items-center mb-2 font-bold text-slate-800 uppercase">
                    <span>LỚP: ${lopChon}</span>
                    <span>TUẦN ${tuanChon.replace(/\D/g,'')}: BUỔI ${tenBuoi}</span>
                </div>
                <div class="text-center italic mb-2 text-sm text-slate-600">
                    (Từ ngày ${ngayDauTieuDe} đến ngày ${ngayCuoiTieuDe})
                </div>
                <table class="w-full border-collapse border border-gray-500 text-sm">
                    <thead class="bg-slate-100 text-center font-bold">
                        <tr>
                            <th class="border border-gray-500 p-2 w-20">THỨ</th>
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
            let ngayCuaThu = mapNgayChinhXac[thu] || (mienNgayHienTai ? tinhNgayTuInputDate(mienNgayHienTai, thu) : '');
            let hienThiThu = ngayCuaThu ? `${thu}<br><span class="text-[11px] font-normal tracking-tight normal-case">${ngayCuaThu}</span>` : thu;

            for (let tiet = 1; tiet <= soTietToiDa; tiet++) {
                let khoaKiemTra = `${thu}_${buoiKey}_${tiet}`;
                let dongDuLieu = dictTKB[khoaKiemTra]; 

                let monHoc = dongDuLieu ? dongDuLieu['Môn Học'] : '';
                let tietPPCT = dongDuLieu ? dongDuLieu['TietPPCT_Thuc'] : '';
                let isDaLuu = dongDuLieu ? dongDuLieu['DaLuu'] : false;
                let tenBai = dongDuLieu ? dongDuLieu['TenBai_Thuc'] : '';

                // Bám sát CSDL: Format đẹp mắt cho những bài chưa có phân phối
                let cssTenBai = isDaLuu ? "text-green-800 font-semibold" : "text-slate-700 font-semibold";
                if (tenBai === 'Chưa có dữ liệu PPCT') cssTenBai = "text-gray-400 italic text-xs font-normal";

                html += `<tr class="hover:bg-slate-50">`;
                
                if (tiet === 1) html += `<td class="border border-gray-500 text-center font-bold uppercase leading-tight" rowspan="${soTietToiDa}">${hienThiThu}</td>`;

                html += `
                    <td class="border border-gray-500 text-center p-1.5">${tiet}</td>
                    <td class="border border-gray-500 text-center p-1.5"></td>
                    <td class="border border-gray-500 p-1.5 font-semibold text-center text-slate-800" data-loai="mon">${monHoc}</td>
                    <td class="border border-gray-500 text-center p-1.5 font-bold text-blue-800" data-loai="tiet">${tietPPCT}</td>
                    <td class="border border-gray-500 p-1.5 ${cssTenBai}" data-loai="tenBai" data-daluu="${isDaLuu}">${tenBai}</td>
                    <td class="border border-gray-500 p-1.5"></td>
                </tr>`;
            }
        });

        html += `</tbody></table></div>`;
        return html;
    };

    vungHienThi.innerHTML = thanhCanhBaoRender + taoBangHtml("SÁNG", 5) + taoBangHtml("CHIỀU", 4);
}

// =========================================================================
// KHỐI 3: HÀM ĐỒNG BỘ TÊN BÀI THEO NÚT BẤM
// =========================================================================
function dongBoTenBaiHoc() {
    const btn = document.getElementById('btnDongBoTenBai');
    let textGoc = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span class="ml-1">Đang xử lý...</span>`;
        btn.disabled = true;
    }

    setTimeout(() => {
        let lopChon = document.getElementById('chonLopSo')?.value;
        if (!lopChon) {
            if (btn) { btn.innerHTML = textGoc; btn.disabled = false; }
            return;
        }
        
        let matchKhoi = lopChon.match(/\d+/);
        let khoi = matchKhoi ? matchKhoi[0] : '';
        
        let cacDong = document.querySelectorAll('#vungHienThiSoDauBai tbody tr');
        
        cacDong.forEach(dong => {
            let oMon = dong.querySelector('td[data-loai="mon"]');
            let oTiet = dong.querySelector('td[data-loai="tiet"]');
            let oTenBai = dong.querySelector('td[data-loai="tenBai"]');
            
            if (oMon && oTiet && oTenBai) {
                let isDaLuu = oTenBai.getAttribute('data-daluu') === 'true';
                if (isDaLuu) return; // Bảo vệ nguyên trạng Dữ liệu quá khứ

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
                    } else {
                        oTenBai.innerHTML = `<span class="text-gray-400 italic text-xs font-normal">Chưa có dữ liệu PPCT</span>`;
                    }
                }
            }
        });
        
        if (btn) { 
            btn.innerHTML = textGoc; 
            btn.disabled = false; 
        }
    }, 100); 
}

// =========================================================================
// KHỐI 4: LƯU SỔ ĐẦU BÀI VÀ KẾT XUẤT (WORD/EXCEL)
// =========================================================================
async function luuSoDauBaiSangMayChu() {
    let tuanChon = document.getElementById('chonTuanSo')?.value;
    let lopChon = document.getElementById('chonLopSo')?.value;
    if (!tuanChon || !lopChon) return alert("Vui lòng chọn Tuần và Lớp trước khi lưu!");

    if (!confirm(`Xác nhận chốt dữ liệu Sổ đầu bài Lớp ${lopChon} - ${tuanChon} vào Cơ sở dữ liệu?`)) return;

    const btn = document.getElementById('btnLuuSoDauBai');
    let textGoc = btn.innerHTML;
    btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span class="ml-1">Đang lưu...</span>`;
    btn.disabled = true;

    try {
        let duLieuQuetDuoc = [];
        let cacBang = document.querySelectorAll('#vungHienThiSoDauBai .bang-so-dau-bai-container');

        cacBang.forEach(khungBang => {
            let tieuDeBuoi = khungBang.querySelector('.flex.justify-between').innerText;
            let buoi = tieuDeBuoi.includes('SÁNG') ? 'Sáng' : 'Chiều';
            let thuHienTai = ''; let ngayHienTai = '';

            let cacDong = khungBang.querySelectorAll('table tbody tr');
            cacDong.forEach(dong => {
                let rData = [];
                dong.querySelectorAll('th, td').forEach(cell => rData.push(cell.innerText.trim()));

                if (rData.length === 7) {
                    let textThuNgay = rData[0].split('\n'); 
                    thuHienTai = textThuNgay[0].trim();
                    ngayHienTai = textThuNgay.length > 1 ? textThuNgay[1].trim() : '';
                    rData.shift(); 
                }

                let tiet = rData[0]; let mon = rData[2]; let tietPPCT = rData[3]; let tenBai = rData[4];

                if (mon && mon !== '') {
                    let tuanSo = tuanChon.replace(/\D/g, '');
                    let maLuuTru = `${tuanSo}_${lopChon}_${thuHienTai}_${buoi}_${tiet}`;

                    duLieuQuetDuoc.push({
                        maLuuTru: maLuuTru, tuan: tuanSo, maLop: lopChon,
                        thu: thuHienTai, ngay: ngayHienTai, buoi: buoi, tiet: tiet,
                        mon: mon, tietPPCT: tietPPCT, tenBai: tenBai
                    });
                }
            });
        });

        if (duLieuQuetDuoc.length === 0) {
            btn.innerHTML = textGoc; btn.disabled = false;
            return alert("Sổ đầu bài đang trống, không có dữ liệu để lưu.");
        }

        const payload = { thaoTac: 'luuSoDauBaiDongBo', tuan: tuanChon.replace(/\D/g, ''), lop: lopChon, duLieu: duLieuQuetDuoc };
        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, { method: 'POST', body: JSON.stringify(payload) });
        const ketQua = await phanHoi.json();

        if (ketQua.trangThai === 'thanh_cong') alert(`✅ Đã chốt thành công Sổ đầu bài Lớp ${lopChon} - Tuần ${tuanChon.replace(/\D/g, '')}!`);
        else throw new Error(ketQua.thongBao);

    } catch (loi) { alert("Lưu thất bại: " + loi.message); } 
    finally { btn.innerHTML = textGoc; btn.disabled = false; }
}

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
    
    let noiDungClone = vungHienThi.cloneNode(true);
    let canhBaoNode = noiDungClone.querySelector('.border-red-500');
    if (canhBaoNode) canhBaoNode.remove();

    let htmlContent = preHtml + noiDungClone.innerHTML + "</div></body></html>";
    let blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SoDauBai_Lop${lopChon}_Tuan${tuanChon.replace(/\D/g,'')}.doc`;
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
        link.download = `SoDauBai_Lop${lopChon}_Tuan${tuanChon.replace(/\D/g,'')}.xlsx`;
        link.click();

    } catch (loi) {
        console.error(loi);
        alert("Có lỗi khi tạo tệp Excel!");
    }
}
