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
        // Sử dụng hàm bảo vệ từ app.js để tự động thử lại khi mất mạng
        const phanHoi = await fetchVoiCoCheThuLai(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDuLieuSoDauBai`);
        
        // Quét thô dữ liệu để kiểm soát ngoại lệ từ Google
        const phanHoiText = await phanHoi.text();
        let duLieuSever;
        try {
            duLieuSever = JSON.parse(phanHoiText);
        } catch (loiParse) {
            throw new Error("Phản hồi từ Google Apps Script bị hỏng hoặc chưa Deploy phiên bản mới.");
        }

        // Bắt lỗi truyền lên từ khối Try...Catch của tệp Code.gs
        if (duLieuSever.trangThai === 'loi_he_thong') {
            throw new Error(duLieuSever.thongBao);
        }
        
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
