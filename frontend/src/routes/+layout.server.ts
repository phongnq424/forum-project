export async function load({ locals }: { locals: App.Locals }) {
    return {
        user: locals.user // Truyền dữ liệu user đã xác thực xuống Layout
    };
}