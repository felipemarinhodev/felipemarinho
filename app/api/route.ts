export async function GET(request: Request) {
  return new Response(JSON.stringify({ message: "hello" }), {
    status: 200,
  });
}
