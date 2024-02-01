import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/src/layouts';
import type { getStaticProps } from '@/src/components/pages/home/props';
import styled from '@emotion/styled';
import aboutJson from './About.json';

const faces: Array<{
    photo: string;
    name: string;
    description: string;
    position: string;
    ln: string;
}> = aboutJson.faces;

export const About: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');
    return (
        <Layout navigation={props.navigation} categories={props.categories} pageTitle={t('seo.home')}>
            <Container>
                <h1>{aboutJson.title}</h1>
                <h4>{aboutJson.description}</h4>
                <Faces>
                    {faces.map(f => (
                        <Face key={f.name}>
                            <FaceImage src={`/images/${f.photo}`} />
                            <FaceText>
                                <FaceName>{f.name}</FaceName>
                                <FacePosition>{f.position}</FacePosition>
                            </FaceText>
                            <FaceDescription>{f.description}</FaceDescription>
                            <CoolButtonA target="_blank" href={f.ln}>
                                Connect
                            </CoolButtonA>
                        </Face>
                    ))}
                </Faces>
                <TitleCard data-aos="fade-up">
                    <h3>{aboutJson.TitleCard2.title}</h3>
                    <p>{aboutJson.TitleCard2.text}</p>
                </TitleCard>
                <OpensourceContainer>
                    {aboutJson.Opensource.map((item, i) => (
                        <OpensourceItem key={item.name} data-aos="flip-right">
                            <OpensourceItemContentWrapper href={item.href} target="_blank">
                                <OpensourceItemContent>
                                    <h5>{item.name}</h5>
                                    <p>{aboutJson.Opensource[i].content}</p>
                                </OpensourceItemContent>
                                <svg width="24" height="24" viewBox="0 0 24 24" fillRule="evenodd" clipRule="evenodd">
                                    <path
                                        style={{ fill: 'GrayText' }}
                                        d="M14 4h-13v18h20v-11h1v12h-22v-20h14v1zm10 5h-1v-6.293l-11.646 11.647-.708-.708 11.647-11.646h-6.293v-1h8v8z"
                                    />
                                </svg>
                            </OpensourceItemContentWrapper>
                        </OpensourceItem>
                    ))}
                </OpensourceContainer>
            </Container>
        </Layout>
    );
};
const OpensourceContainer = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, minmax(300px, 1fr));
    grid-gap: 40px;
    margin-bottom: 100px;
    @media (max-width: 1100px) {
        grid-template-columns: repeat(2, minmax(300px, 1fr));
    }
    @media (max-width: 720px) {
        grid-template-columns: repeat(1, 1fr);
    }
`;

const OpensourceItem = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    font-size: 14px;
    line-height: 20px;
    padding: 40px 40px;
    border: 0.5px solid gray;
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;

    :hover {
        transform: scale(1.05);
    }

    h5 {
        margin-bottom: 20px;
    }
    a {
        text-decoration: none;
    }

    @media (max-width: 700px) {
        min-height: auto;
    }
`;

const OpensourceItemContentWrapper = styled.a`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
    height: 100%;
`;

const OpensourceItemContent = styled.div`
    display: flex;
    flex-direction: column;
`;
const CoolButtonA = styled.a`
    background: #fff;
    color: #000;
    font-size: 1.25rem;
    font-weight: 800;
    border-radius: 4px;
    border: 1px solid;
    outline: 0;
    padding: 0.5rem 2rem;
    box-shadow: blue 4px 4px 0px;
    :hover {
        color: #eee;
        background-color: #333;
    }
`;

const Container = styled.div`
    max-width: 1200px;
    margin: 130px auto 0;
    width: 100%;
    user-select: none;
    h1 {
        font-size: 4rem;
        font-style: normal;
        font-weight: 800;
        line-height: 120%;
        color: black;
        margin-bottom: 2rem;
    }
    h4 {
        font-size: 2rem;
        font-style: normal;
        font-weight: 500;
        line-height: 120%;
        color: gray;
    }
`;

const TitleCard = styled.div`
    text-align: center;
    margin-bottom: 50px;

    @media (max-width: 1200px) {
        margin-top: 130px;
    }

    h3 {
        margin-bottom: 20px;
    }
`;

const Faces = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 4rem;
    gap: 4rem;
    font-size: 1.2rem;
`;

const Face = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #fff;
    padding: 4rem;
    align-items: center;
    gap: 2rem;
    border-radius: 4px;
    box-shadow: blue 4px 4px 0px;
`;
const FaceText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
`;

const FaceImage = styled.img`
    width: 12rem;
    height: 12rem;
    border-radius: 6rem;
    box-shadow: 3px 3px 0 2px blue;
`;
const FaceName = styled.div`
    font-weight: 600;
`;
const FacePosition = styled.span``;
const FaceDescription = styled.div``;
