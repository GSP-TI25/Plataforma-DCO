// Ubicación: DCO/apps/frontend/src/components/dashboard/TarjetaDeMetrica.jsx
import estilos from './TarjetaDeMetrica.module.scss';

export default function TarjetaDeMetrica({ titulo, valor, icono, color }) {
  return (
    <div className={estilos.tarjeta} style={{ backgroundColor: color }}>
      <div className={estilos.contenido}>
        <p className={estilos.titulo}>{titulo}</p>
        <h3 className={estilos.valor}>{valor}</h3>
      </div>
      <div className={estilos.iconoWrapper}>
        {icono}
      </div>
    </div>
  );
}