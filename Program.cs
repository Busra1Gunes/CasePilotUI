var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
                .SetIsOriginAllowed(_ => true) // Tüm originlere izin ver
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials(); // credentials'a izin ver
        });
});

builder.Services.AddControllers();
// ... existing code ...

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS middleware'ini HTTPS yönlendirmesinden ÖNCE ekle
app.UseCors("AllowAll");

// HTTPS yönlendirmesini development ortamında devre dışı bırak
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// ... existing code ... 