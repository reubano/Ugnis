import * as React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  padding-top: 40px;
  padding-bottom: 64px;
  padding-left: 64px;
  padding-right: 64px;
`
const Top = styled.div`
  display: block;
  text-align: center;
  font-family: Roboto;
  font-size: 36px;
`
const SubTop = styled.div`
  text-align: center;
  font-size: 24px;
  font-family: Roboto;
`
const Subhead = styled.div`
  display: block;
  font-size: 22px;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  padding: 15px;
  border-bottom: 3px dotted #d9d9d9;
  font-weight: normal;
`
const Content = styled.div`
  display: block;
  padding-top: 5px;
  padding-left: 15px;
  font-weight: lighter;
`

const HomePage = () => {
  return (
    <Container>
      <Container>
        <Top>
          <h2>Welcome to Ugnis</h2>
        </Top>
        <SubTop>A visual design tool with no CSS</SubTop>
      </Container>
      <Subhead>Click on the left menu to start</Subhead>
      <Subhead>How to setup</Subhead>
      <Content>Setup - `npm i --save ugnis`, `ugnis open` or `ugnis compile`</Content>
      <Subhead>Ugnis as component library</Subhead>
      <Content>With Ugnis you may create and export your own custom components in a matter of minutes</Content>
      <Subhead>Ugnis as CSS generator</Subhead>
      <Content>
        Ugnis is a tool, that can easily generate CSS grid layouts and allow you to customize these layouts as elements,
        components or either pages
      </Content>
    </Container>
  )
}

export default HomePage
