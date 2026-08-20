import { useRef } from 'react';

type ProjectCardProps = {
  title: string;
  summary: string;
  video?: string;
  image?: string;
  link?: string;
};

export default function ProjectCard({ title, summary, video, image, link }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => videoRef.current?.play();
  const handleLeave = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  const card = (
    <div
      className="project-card"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="media">
        {video ? (
          <video ref={videoRef} src={video} muted loop playsInline poster={image} />
        ) : image ? (
          <img src={image} alt={title} />
        ) : null}
      </div>
      <h3>{title}</h3>
      <p>{summary}</p>
    </div>
  );

  return link ? <a href={link}>{card}</a> : card;
}
