using Microsoft.EntityFrameworkCore;
using Dominio;

namespace Negocio
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Remito> Remitos { get; set; }
        public DbSet<ItemRemito> ItemsRemito { get; set; }

        public DbSet<NotaSalida> NotasSalida { get; set; }
        public DbSet<ItemSalida> ItemsSalida { get; set; }
        public DbSet<NotaEntrada> NotasEntrada { get; set; }
        public DbSet<ItemEntrada> ItemsEntrada { get; set; }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<AuditoriaRemito> AuditoriasRemito { get; set; }
        public DbSet<AuditoriaItemRemito> AuditoriasItemRemito { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
          
            modelBuilder.Entity<ItemRemito>()
                .HasOne(i => i.Remito)
                .WithMany(r => r.Items)
                .HasForeignKey(i => i.id_remito)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

           
            modelBuilder.Entity<ItemRemito>()
                .HasIndex(i => new { i.serial, i.id_remito })
                .IsUnique();


            modelBuilder.Entity<NotaSalida>()
                .HasOne(n => n.Autorizante)
                .WithMany()
                .HasForeignKey(n => n.AutorizanteId);

            modelBuilder.Entity<ItemSalida>()
                .HasOne(i => i.NotaSalida)
                .WithMany(n => n.Items)
                .HasForeignKey(i => i.NotaSalidaId);

            modelBuilder.Entity<NotaEntrada>()
               .HasOne(n => n.Autorizante)
               .WithMany()
               .HasForeignKey(n => n.AutorizanteId);

            modelBuilder.Entity<ItemEntrada>()
                .HasOne(i => i.NotaEntrada)
                .WithMany(n => n.Items)
                .HasForeignKey(i => i.NotaEntradaId);

            modelBuilder.Entity<AuditoriaRemito>(entity =>
            {
                entity.ToTable("auditoria_remitos");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.IdRemito).HasColumnName("id_remito");
                entity.Property(e => e.TipoOperacion).HasColumnName("tipo_operacion").HasMaxLength(10);
                entity.Property(e => e.UsuarioOperacion).HasColumnName("usuario_operacion").HasMaxLength(100);
                entity.Property(e => e.FechaOperacion).HasColumnName("fecha_operacion");
                entity.Property(e => e.DatosAnteriores).HasColumnName("datos_anteriores").HasColumnType("JSON");
                entity.Property(e => e.DatosNuevos).HasColumnName("datos_nuevos").HasColumnType("JSON");
            });

            modelBuilder.Entity<AuditoriaItemRemito>(entity =>
            {
                entity.ToTable("auditoria_items_remito");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.IdItem).HasColumnName("id_item");
                entity.Property(e => e.IdRemito).HasColumnName("id_remito");
                entity.Property(e => e.TipoOperacion).HasColumnName("tipo_operacion").HasMaxLength(10);
                entity.Property(e => e.UsuarioOperacion).HasColumnName("usuario_operacion").HasMaxLength(100);
                entity.Property(e => e.FechaOperacion).HasColumnName("fecha_operacion");
                entity.Property(e => e.DatosAnteriores).HasColumnName("datos_anteriores").HasColumnType("JSON");
                entity.Property(e => e.DatosNuevos).HasColumnName("datos_nuevos").HasColumnType("JSON");
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}